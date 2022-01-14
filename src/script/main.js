import {ajax} from "./ajax.js"; // 注意这里一定要写文件后缀！
const key = "5f9a83a6843c4083865a6b1a41ce43f3"; // 请求参数
const location = "101010100"

const navigate = document.getElementById("navigate");   // 跳转到搜索页
const homePage = document.getElementById("home_page");
const searchPage = document.getElementById("search_page");
// 获取location
const current_city = document.getElementById("current_city");   // li
// 实时天气
const nowWeather = document.getElementsByClassName("weather")[0];
const nowDegree = document.getElementById("degree");
const nowApi = document.getElementsByClassName("api")[0];
const temperEcharts = document.getElementsByClassName("echarts")[0];

const weatherEcharts = document.getElementsByClassName("echarts")[1];
const week = document.getElementsByClassName("week")[0];
const dayWeather = document.getElementsByClassName("weather")[1];  // 一周天气——日间
const dayIcons = document.getElementsByClassName("icons")[0];  // 白天天气图标
const nightIcons = document.getElementsByClassName("icons")[1]; // 夜晚天气图标
const nightWeather = document.getElementsByClassName("weather")[2];  // 一周天气——夜间
const windDir = document.getElementsByClassName("wind")[0];    // 一周风向
const windScale = document.getElementsByClassName("wind")[1];    // 一周风力等级
const exponent = document.getElementById("exponent");
const download = document.getElementById("download");
const closeBtn = document.getElementById("close_btn");

const width = window.innerWidth;

// 跳转到搜索页:
{
    navigate.addEventListener("click", () => {
        // 主页隐藏
        homePage.setAttribute("style", "display: none");
        // 搜索页显示
        searchPage.setAttribute("style", "display: block");
    })
}

// 实时天气、生活指数
{
    ajax({url: "https://devapi.qweather.com/v7/weather/now", data: {key, location}})
        .then(data => {
            const {now} = data;
            console.log(now)
            nowWeather.innerHTML = now.text;
            nowDegree.innerHTML = `
            <span>${now.temp}</span>
            <p>${now.windDir}${now.windScale}级 湿度${now.humidity}%</p>
            `
        })
        // 等实时天气中内容加载完
        .then(() => ajax({
                url: "https://devapi.qweather.com/v7/indices/1d",
                data: {key, location, type: 0}
            })
                .then(data => {
                    const {daily} = data;
                    let innerHTML = "";
                    daily.map(item => {
                        // 天气描述用感冒指数描述代替:
                        if (item.type.toString() === "9") {
                            nowDegree.innerHTML += `<p>${item.text}</p>`
                        }
                        innerHTML += `<li>
                <img src="../assets/exponent/default.png" alt="icon" />
                <span>${item.name.slice(0, -2)}<br>${item.category}</span>
            </li>`
                    })
                    exponent.innerHTML = innerHTML;
                })
        )
}

// 实时空气质量
{
    ajax({url: "https://devapi.qweather.com/v7/air/now", data: {key, location}})
        .then(data => {
            const { now } = data;
            console.log(now)
            nowApi.innerHTML = `${now.aqi} ${now.category}`
        })
}

// 今明天气

// 24小时温度、风力
{
    const hour = new Date().getHours();
    const myEcharts = echarts.init(temperEcharts, null, {
        width:2000,
        height: 110,
    });
    ajax({url: "https://devapi.qweather.com/v7/weather/24h", data: {key, location}})
        .then(data => {
            const { hourly } = data;
            console.log(hourly)
            const tempArr = [], hourArr = [];
            hourly.map(item => {
                tempArr.push(item.temp);
                hourArr.push(item.fxTime.slice(11,13))
            })
            console.log(hourArr)
            const options = {
                xAxis: {
                    type: "category",
                    data: hourArr,
                    // boundaryGap: false, // 坐标轴留白
                },
                yAxis: {
                    show: false,
                    boundaryGap: false,
                },
                series: [{
                    type: "line",
                    data: tempArr,
                    lineStyle: {
                        color: "#fff",
                        width: '1',
                    },
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                color: "#fff"
                            },
                            color: "#fff",
                        }
                    }
                }]
            }
            myEcharts.setOption(options);
        })
}

// 本周天气:
{
    // 一：星期几:
    const dayNum = new Date().getDay(); // 获取当天星期几
    const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日", "周一", "周二", "周三", "周四", "周五"];
    let week_innerHTML = "";
    for (let i = dayNum - 1; i < dayNum - 1 + 7; i++) { // i=dayNum-1是因为第一个显示昨天
        week_innerHTML += `<li>${weekDay[i]}</li>`
    }
    week.innerHTML = week_innerHTML;

    const weekChart = echarts.init(weatherEcharts, null, {
        width,
        height: 248,
    });
    ajax({     // 获取数据
        url: "https://devapi.qweather.com/v7/weather/7d",
        data: {key, location},
    })
        .then(data => {
            const {daily} = data;
            // console.log(daily)
            let tempMaxArr = [], tempMinArr = [];
            let weatherArr = [];
            daily.map(item => {
                weatherArr.push({
                    day_weather: item.textDay,
                    dayIcon: item.iconDay,
                    nightIcons: item.iconNight,
                    night_weather: item.textNight,
                    wind: item.windDirDay,
                    windScale: item.windScaleDay,
                })
                tempMaxArr.push(item.tempMax);
                tempMinArr.push(item.tempMin);
            })

            weatherArr.map(item => {
                // 二：白天天气:
                dayWeather.innerHTML += `<li>${item.day_weather}</li>`;
                // 三：白天天气图标:
                // dayIcon_innerHTML += `<img
                //     src="../../assets/qWeather_icons/101.svg"
                //     alt="icon"/>`
                dayIcons.innerHTML += `<li>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="qi-101" viewBox="0 0 16 16">
                        <path d="M4.995 1.777a.516.516 0 0 0 .503.404.535.535 0 0 0 .112-.012.517.517 0 0 0 .392-.616L5.746.403A.516.516 0 0 0 4.74.627zM1.273 3.535l.994.633a.516.516 0 0 0 .555-.87l-.995-.633a.516.516 0 0 0-.554.87zM.878 8.043l1.15-.256a.516.516 0 1 0-.223-1.008l-1.15.256a.516.516 0 0 0 .111 1.02.535.535 0 0 0 .112-.012zm10.238-2.28a.535.535 0 0 0 .112-.012l1.15-.256a.516.516 0 1 0-.224-1.008l-1.15.256a.516.516 0 0 0 .112 1.02zM8.772 2.728a.516.516 0 0 0 .712-.158l.633-.994a.516.516 0 0 0-.87-.554l-.633.994a.516.516 0 0 0 .158.712zM3.07 7.032a3.506 3.506 0 0 0 .33.87 3.129 3.129 0 0 0 .909-.486 2.453 2.453 0 0 1-.233-.608 2.504 2.504 0 0 1 1.9-2.988 2.5 2.5 0 0 1 2.988 1.9c.003.013.002.026.005.038a5.42 5.42 0 0 1 1.063.25 3.509 3.509 0 0 0-.061-.512 3.535 3.535 0 1 0-6.902 1.536z"/>
                        <path d="M12.715 8.48a3.236 3.236 0 0 0-.41.04 4.824 4.824 0 0 0-8.086 0 3.234 3.234 0 0 0-.409-.04 3.285 3.285 0 1 0 1.283 6.31 4.756 4.756 0 0 0 6.339 0 3.286 3.286 0 1 0 1.283-6.31zm0 5.539a2.238 2.238 0 0 1-.88-.179 1.032 1.032 0 0 0-1.083.173 3.724 3.724 0 0 1-4.98 0 1.032 1.032 0 0 0-1.082-.173 2.254 2.254 0 1 1-.88-4.329 1.265 1.265 0 0 1 .175.02l.105.014a1.031 1.031 0 0 0 .992-.459 3.792 3.792 0 0 1 6.36 0 1.031 1.031 0 0 0 .992.459l.105-.014a1.266 1.266 0 0 1 .176-.02 2.254 2.254 0 1 1 0 4.508z"/>
                    </svg>
                </li>`;
                // 五：夜晚天气图标:
                nightIcons.innerHTML += `<li>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="qi-101" viewBox="0 0 16 16">
                        <path d="M4.995 1.777a.516.516 0 0 0 .503.404.535.535 0 0 0 .112-.012.517.517 0 0 0 .392-.616L5.746.403A.516.516 0 0 0 4.74.627zM1.273 3.535l.994.633a.516.516 0 0 0 .555-.87l-.995-.633a.516.516 0 0 0-.554.87zM.878 8.043l1.15-.256a.516.516 0 1 0-.223-1.008l-1.15.256a.516.516 0 0 0 .111 1.02.535.535 0 0 0 .112-.012zm10.238-2.28a.535.535 0 0 0 .112-.012l1.15-.256a.516.516 0 1 0-.224-1.008l-1.15.256a.516.516 0 0 0 .112 1.02zM8.772 2.728a.516.516 0 0 0 .712-.158l.633-.994a.516.516 0 0 0-.87-.554l-.633.994a.516.516 0 0 0 .158.712zM3.07 7.032a3.506 3.506 0 0 0 .33.87 3.129 3.129 0 0 0 .909-.486 2.453 2.453 0 0 1-.233-.608 2.504 2.504 0 0 1 1.9-2.988 2.5 2.5 0 0 1 2.988 1.9c.003.013.002.026.005.038a5.42 5.42 0 0 1 1.063.25 3.509 3.509 0 0 0-.061-.512 3.535 3.535 0 1 0-6.902 1.536z"/>
                        <path d="M12.715 8.48a3.236 3.236 0 0 0-.41.04 4.824 4.824 0 0 0-8.086 0 3.234 3.234 0 0 0-.409-.04 3.285 3.285 0 1 0 1.283 6.31 4.756 4.756 0 0 0 6.339 0 3.286 3.286 0 1 0 1.283-6.31zm0 5.539a2.238 2.238 0 0 1-.88-.179 1.032 1.032 0 0 0-1.083.173 3.724 3.724 0 0 1-4.98 0 1.032 1.032 0 0 0-1.082-.173 2.254 2.254 0 1 1-.88-4.329 1.265 1.265 0 0 1 .175.02l.105.014a1.031 1.031 0 0 0 .992-.459 3.792 3.792 0 0 1 6.36 0 1.031 1.031 0 0 0 .992.459l.105-.014a1.266 1.266 0 0 1 .176-.02 2.254 2.254 0 1 1 0 4.508z"/>
                    </svg>
                </li>`
                // 六：夜晚天气
                nightWeather.innerHTML += `<li>${item.night_weather}</li>`
                // 八：风向（日间
                windDir.innerHTML += `<li>${item.wind}</li>`
                // 九：风力等级（日间
                windScale.innerHTML += `<li>${item.windScale}级</li>`
            })
            // 四：温度曲线
            const option = {
                xAxis: {
                    type: "category",
                    show: false,
                    boundaryGap: false, // 坐标轴留白
                },
                yAxis: {
                    show: false,
                    boundaryGap: false,
                },
                series: [{
                    type: "line",
                    smooth: true,
                    data: tempMaxArr,
                    lineStyle: {
                        color: "#fff",
                        width: '1',
                    },
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                color: "#fff"
                            },
                            color: "#fff",
                        }
                    }
                }, {
                    type: "line",
                    smooth: true,
                    data: tempMinArr,
                    lineStyle: {
                        color: "#fff",
                        width: '1',
                    },
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'bottom',
                                color: "#fff",
                            },
                            color: "#fff",
                        },
                    }
                }]
            }
            weekChart.setOption(option);
        })

}

// 下载窗
{
    download.addEventListener("click", () => {
        self.location = "https://promo.moji.com/moji_download/download.html";   // c跳转到下载页
    });
    closeBtn.addEventListener("click", (e) => {
        download.setAttribute("style", "display:none")
        e.stopPropagation();    // 阻止事件冒泡到上层 触发下载
    });
}