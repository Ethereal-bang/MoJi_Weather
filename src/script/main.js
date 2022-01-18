import {ajax} from "./ajax.js"; // 注意这里一定要写文件后缀！
import weekAqi from '../mockdata/aqi.js';
import {
    key,
    city,
    nowDegree,
    searchPage,
    homePage,
    navigate,
    download,
    closeBtn,
    windDir,
    windScale,
    week,
    exponent,
    dayWeather,
    dayIcons,
    nightWeather,
    nowApi,
    nowWeather,
    nightIcons,
    weatherEcharts,
    temperEcharts,
    nowApiImg,
    dayTwo,
    weekApi,
    temper,
    wind,
    hourTab1,
    hourTab2,
    tab1,
    tab2,
    windEcharts,
    hourContainer,
} from './constant.js';

// 跳转到搜索页:
{
    navigate.addEventListener("click", () => {
        // 主页隐藏
        homePage.setAttribute("style", "display: none");
        // 搜索页显示
        searchPage.setAttribute("style", "display: block");
    })
}

// 当前城市
export function setCity() {
    city.innerText = window.localStorage.getItem("location");
}

setCity();

// 实时天气、生活指数 `info_box`、`exponent`
export function setWeather() {
    function judgeExponentImg(name) {
        switch (name) {
            case "运动": return "exercise.png";
            case "钓鱼": return "fishing.png";
            case "感冒": return "cold.png";
            case "洗车": return "carWashing.png";
            case "空气污染扩散条件": return "airPollution.png";
            case "交通": return "traffic.png";
            case "化妆": return "makeup.png";
            case "穿衣": return "dressing.png";
            case "紫外线": return "uv.png";
            case "旅游": return "travel.png";
            case "过敏": return "allergy.png";
            case "舒适度": return "comfort.png";
            case "空调开启": return "conditioner.png";
            case "太阳镜": return "sunglasses.png";
            case "晾晒": return "drying.png";
            case "防晒": return "sunProtection.png";
            default: return "default.png";
        }
    }
    ajax({
        url: "https://devapi.qweather.com/v7/weather/now", data: {
            key,
            location: localStorage.getItem("locationId")
        }
    })
        .then(data => {
            const {now} = data;
            // console.log(now)
            nowWeather.innerHTML = now.text;
            nowDegree.innerHTML = `
            <span>${now.temp}</span>
            <p>${now.windDir}${now.windScale}级 湿度${now.humidity}%</p>
            `
        })
        // 等实时天气中内容加载完
        .then(() => ajax({
                url: "https://devapi.qweather.com/v7/indices/1d",
                data: {
                    key,
                    location: localStorage.getItem("locationId"),
                    type: 0
                }
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
                            <img src=../assets/exponent/${judgeExponentImg(item.name.slice(0, -2))} alt="icon" />
                            <span>${item.name.slice(0, -2)}<br>${item.category}</span>
                        </li>`
                    })
                    exponent.innerHTML = innerHTML;
                })
        )
}

setWeather();

// 实时空气质量 `info_box`
export function setApi() {
    ajax({
        url: "https://devapi.qweather.com/v7/air/now", data: {
            key,
            location: localStorage.getItem("locationId")
        }
    })
        .then(data => {
            const {aqi, category} = data.now;
            // console.log(data.now)
            if (category === "优") {
                nowApiImg.setAttribute("class", "warn_1");// 改变图标背景颜色
                nowApiImg.innerHTML = `<img src="../../assets/info_box/aqi_1.png" alt="api_img">`
            } else if (category === "良") {
                nowApiImg.setAttribute("class", "warn_2");
                nowApiImg.innerHTML = `<img src="../../assets/info_box/aqi_1.png" alt="api_img">`
            } else {
                nowApiImg.innerHTML = `<img src="../../assets/info_box/aqi_3.png" alt="api_img">`
                if (category === "轻度污染") {
                  nowApiImg.setAttribute("class", "warn_3");
              } else if (category === "中度污染") {
                  nowApiImg.setAttribute("class", "warn_4");
              }
            }
            nowApi.innerHTML = `${aqi} ${category}`
        })
}

setApi();

// 24小时温度、风力
export function setHourTemper() {
    // 切换tabs
    {
        temper.addEventListener("click", () => {
            temper.setAttribute("class", "active");
            wind.removeAttribute("class");
            temperEcharts.setAttribute("style", "display:block");
            windEcharts.setAttribute("style", "display:none");
        })
        wind.addEventListener("click", () => {
            wind.setAttribute("class", "active");
            temper.removeAttribute("class");
            temperEcharts.setAttribute("style", "display:none");
            windEcharts.setAttribute("style", "display:block");
        })
        hourTab1.addEventListener("click", () => {
            tab1.setAttribute("style", "display:none");
            tab2.setAttribute("style", "display:block");
            hourContainer.setAttribute("class", "chose_tab2");
        })
        hourTab2.addEventListener("click", () => {
            tab2.setAttribute("style", "display:none");
            tab1.setAttribute("style", "display:block");
            hourContainer.setAttribute("class", "chose_tab1");
        })
    }
    const myTemperEcharts = echarts.init(temperEcharts, null, {
        width: 1000,
        height: 110,
    });
    const myWindEcharts = echarts.init(windEcharts, null, {
        width: 1000,
        height: 110,
    })
    ajax({
        url: "https://devapi.qweather.com/v7/weather/24h", data: {
            key,
            location: localStorage.getItem("locationId")
        }
    })
        .then(data => {
            const {hourly} = data;
            // console.log(hourly)
            const tempArr = [], hourArr = [], windArr = [];
            hourly.map(item => {
                console.log(item.windSpeed)
                tempArr.push(item.temp);
                hourArr.push(item.fxTime.slice(11, 13))
                windArr.push(item.windSpeed);
            })
            // console.log(hourArr)
            tempArr[0] = {
                value: tempArr[0],
                label: {
                    show: true,
                    color: "#fff"
                },
            }
            const optionsToTemper = {
                xAxis: {
                    type: "category",
                    data: hourArr,
                    axisLine: {
                        show: false,    // 不显示坐标轴轴线
                        lineStyle: {
                            color: "#ffffff",
                        }
                    },
                    offset: 27, // 调整x轴位置
                    axisTick: {
                        show: false,    // 不显示坐标轴可读线
                    },
                },
                yAxis: {
                    show: false,
                    boundaryGap: false,
                },
                grid: { // 调整曲线位置
                    left: 0,
                    bottom: 90,
                },
                series: [{
                    type: "line",
                    data: tempArr,
                    lineStyle: {
                        color: "#fff",
                        width: '1',
                    },
                    color: "#fff"
                }]
            }
            myTemperEcharts.setOption(optionsToTemper);
            windArr[0] = {  // 单独配置数据项
                value: windArr[0],
                label: {
                    show: true,
                    color: "#fff",
                },
            }
            const optionsToWind = {
                xAxis: {
                    type: "category",
                    data: hourArr,
                    axisLine: {
                        show: false,    // 不显示坐标轴轴线
                        lineStyle: {
                            color: "#ffffff",
                        }
                    },
                    offset: 27, // 调整x轴位置
                    axisTick: {
                        show: false,    // 不显示坐标轴可读线
                    },
                },
                yAxis: {
                    show: false,
                    boundaryGap: false,
                },
                grid: { // 调整曲线位置
                    left: 0,
                    bottom: 90,
                },
                series: [{
                    type: "line",
                    data: windArr,
                    lineStyle: {
                        color: "#fff",
                        width: '1',
                    },
                    color: "#fff"
                }]
            }
            myWindEcharts.setOption(optionsToWind);
        })
}

setHourTemper();

// 今明天气、本周天气:
export function setWeekWeather() {
    function judgeWeatherIcon(weather, time = 'day') {
        if (weather === "晴") {
            return (time === "day") ? 'sun.png' : 'moon.png';
        } else if (weather === "多云") {
            return (time === "day") ? "cloudy_day.png" : "cloudy_night.png";
        } else if (weather === "阴") {
            return "yin.png";
        } else if (weather === "小雨") {
            return "rain_small.png";
        } else {
            return "rain_small.png";    // 暂定默认
        }
    }
    // 一：星期几:
    {
        const dayNum = (new Date().getDay() === 0) ? 7 : new Date().getDay(); // 获取当天星期几 周日返回7
        const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日", "周一", "周二", "周三", "周四", "周五"];
        let week_innerHTML = "";
        for (let i = dayNum - 1; i < dayNum - 1 + 7; i++) { // i=dayNum-1是因为第一个显示昨天
            week_innerHTML += `<li>${weekDay[i]}</li>`
        }
        week.innerHTML = week_innerHTML;
    }
    window.onresize = () => {
        // console.log(window.innerWidth)
    }
    const weekChart = echarts.init(weatherEcharts, null, {
        width: window.innerWidth,
        height: 248,
    });
    ajax({     // 获取数据
        url: "https://devapi.qweather.com/v7/weather/7d",
        data: {
            key,
            location: localStorage.getItem("locationId")
        },
    })
        .then(data => {
            const {daily} = data;
            // console.log(daily)
            /**
             * @desc 根据等级返回对应class
             * */
            function judgeAqi(category) {
                if (category === "优") {
                    return "warn_1";
                } else if (category === "良") {
                    return "warn_2";
                } else if (category === "轻度污染") {
                    return "warn_3"
                } else if (category === "中度污染") {
                    return "warn_4";
                }
            }
            // 今明天气:
            dayTwo.innerHTML = `
                <div>
                    <div>
                        <span>今天</span>
                        <span class=${judgeAqi(weekAqi[0].category)}>${weekAqi[0].category}</span>
                        <span>${daily[0].tempMin} / ${daily[0].tempMax}°</span>
                    </div>
                    <div>
                        <span>${daily[0].textDay}</span>
                        <img src=../assets/weather/${judgeWeatherIcon(daily[0].textDay)} alt="weather">
                    </div>
                </div>
                <div>
                    <div>
                        <span>明天</span>
                        <span class=${judgeAqi(weekAqi[1].category)}>${weekAqi[1].category}</span>
                        <span>${daily[1].tempMin} / ${daily[1].tempMax}°</span>
                    </div>
                    <div>
                        <span>${daily[1].textDay}</span>
                        <img src=../assets/weather/${judgeWeatherIcon(daily[1].textDay)} alt="weather">
                    </div>
                </div>`
            // 七天天气:
            let tempMaxArr = [], tempMinArr = [];
            let weatherArr = [];
            daily.map(item => {
                weatherArr.push({
                    day_weather: item.textDay,
                    dayIconUrl: judgeWeatherIcon(item.textDay),
                    nightIconsUrl: judgeWeatherIcon(item.textNight, "night"),
                    night_weather: item.textNight,
                    wind: item.windDirDay,
                    windScale: item.windScaleDay,
                })
                tempMaxArr.push(item.tempMax);
                tempMinArr.push(item.tempMin);
            })

            let dayWeatherInner = "", dayIconsInner = "", nightIconsInner = "", nightWeatherInner = "",
                windDirInner = "", windScaleInner = "";
            weatherArr.map(item => {
                // 二：白天天气:
                dayWeatherInner += `<li>${item.day_weather}</li>`;
                // 三：白天天气图标:
                // dayIcon_innerHTML += `<img
                //     src="../../assets/qWeather_icons/101.svg"
                //     alt="icon"/>`
                dayIconsInner += `<li><img src=../../assets/weather/${item.dayIconUrl} alt="weather img"></li>`;
                // 五：夜晚天气图标:
                nightIconsInner += `<li><img src=../../assets/weather/${item.nightIconsUrl} alt="weather img"></li>`;
                // 六：夜晚天气
                nightWeatherInner += `<li>${item.night_weather}</li>`
                // 八：风向（日间
                windDirInner += `<li>${item.wind}</li>`
                // 九：风力等级（日间
                windScaleInner += `<li>${item.windScale}级</li>`
            })
            // 这样渲染 1.减少多个li的渲染次数 2.当前城市更新后调用函数不会出现多个渲染叠加的效果`+=`
            {
                dayWeather.innerHTML = dayWeatherInner;
                dayIcons.innerHTML = dayIconsInner;
                nightIcons.innerHTML = nightIconsInner;
                nightWeather.innerHTML = nightWeatherInner;
                windDir.innerHTML = windDirInner;
                windScale.innerHTML = windScaleInner;
            }
            // 七：空气质量
            let weekAqiInner = "";
            weekAqi.map(item => {
                // console.log(item)
                const { category } = item;
                weekAqiInner += `<li class = ${judgeAqi(category)}>${item.category.slice(0, 2)}</li>`
            })
            weekApi.innerHTML = weekAqiInner;
            // 四：温度曲线
            const option = {
                baseOption: {
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
                    }],
                },
                media: [
                    {
                        option: {
                            grid: {
                                left: 35,
                                right: 35,
                            },
                        },
                    },
                ]
            }
            weekChart.setOption(option);
        })

}

setWeekWeather();

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
