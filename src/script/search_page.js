import { ajax } from './ajax.js';
import { setWeather, setHourTemper, setWeekWeather, setApi, setCity } from './main.js';
import { key,  searchPage, homePage, } from './constant.js';
const returnBtn = document.getElementById("return");    // 回退箭头
const searchCityInput = document.getElementsByTagName("input")[0];
const sections = document.getElementsByTagName("section");  // section
const citiesList = document.getElementById("cities_list");  // ul城市搜索列表
const current_city = document.getElementById("current_city");   // li
const recordList = document.getElementById("record_list");  // ul
const clearBtn = document.getElementById("clearBtn");
const hotCities = document.getElementById('hot_cities');    // ul

// 跳转到主页
function backPage() {
    searchPage.setAttribute("style", "display: none");
    homePage.setAttribute("style", "display: block");
}
returnBtn.addEventListener("click", backPage);

// 搜索城市:
{
    searchCityInput.addEventListener("input", (e) => { // 输入框值改变时触发
        function hiddenList() { // 展示其他板块、隐藏搜索列表
            for (let i = 0; i < sections.length; i++) {  // 显示其他版块
                sections[i].setAttribute("style", "visibility: visible");
            }
            citiesList.innerHTML = "";
        }

        const searchName = e.target.value;
        if (searchName === "") {
            hiddenList();
            return;
        }

        ajax({
            url: "https://geoapi.qweather.com/v2/city/lookup",
            data: {key, location: searchName, range: "cn"},
        })
            .then(data => {
                let innerContent = "";
                data.location?.map(item => {
                    innerContent += `<li><a>${item.name}</a></li>`;
                })
                citiesList.innerHTML = innerContent;
            })
        // 隐藏其他版块
        for (let i = 0; i < sections.length; i++) {
            sections[i].setAttribute("style", "visibility: hidden");
        }
        // 给搜索匹配列表添加点击事件
        citiesList.addEventListener("click", (e) => {
            if (e.target.nodeName === "A") {
                selectCity(e.target.innerText);
                // 点击之后列表隐藏且其他板块展示:
                hiddenList();
            }
        }, {capture: true});
    })
}

// 选择城市
function selectCity(city) {
    updateCity(city);   // 更新——当前城市
    addRecord(city);    // 更新——添加记录
}

// 当前城市:
localStorage.setItem('location', "重庆"); // 默认重庆
localStorage.setItem('locationId', "101040100");
const updateCity = (city) => {
    current_city.innerHTML = `<a>${city}</a>`;
    localStorage.setItem('location', city);
    // 获得该城市的locationId
    ajax({
        url: "https://geoapi.qweather.com/v2/city/lookup",
        data: {key, location: city, range: "cn", number: 1},
    })
        .then(data => {
            localStorage.setItem('locationId', data?.location[0].id);
            console.log(localStorage.getItem('locationId'))
        })
    // 回到主页且重新渲染:
    backPage();
    setWeather();
    setCity();
    setApi();
    setHourTemper();
    setWeekWeather();
}

// 历史记录——1.热搜城市；2.搜索框:
// if (localStorage.getItem("recordList")) {
//     console.log(localStorage.getItem("recordList"))  // [object Object]
// }
const addRecord = (function () {
    let map;    // 闭包存储记录，去重
    return function (city) {
        if (!map) {
            map = {};
        }
        if (!map[city]) {
            map[city] = city;
            localStorage.setItem("recordList", map);
            recordList.innerHTML += `<li><a>${city}</a></li>`;
        }
    }
})()

// 删除记录:
{
    clearBtn.addEventListener("click", () => {
        recordList.innerHTML = "";
    });
}

// 热搜城市:
{
    ajax({
        url: "https://geoapi.qweather.com/v2/city/top",
        data: {key, range: "cn", number: 7},
    })
        .then((data) => {
            const {topCityList} = data;
            let ulInner = "";
            topCityList.map(list => {
                ulInner += `<li><a id=${list.name}>${list.name}</a></li>`;
            });
            hotCities.addEventListener("click", (e) => {
                if (e.target.nodeName === "A") {
                    selectCity(e.target.innerText);
                }
            }, {capture: true,});
            // 只渲染一次
            hotCities.innerHTML = ulInner;
        })
}
