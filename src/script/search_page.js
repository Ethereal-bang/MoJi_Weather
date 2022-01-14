import {ajax} from './ajax.js';
const key = "5f9a83a6843c4083865a6b1a41ce43f3"; // 请求参数

const returnBtn = document.getElementById("return");    // 回退箭头
const homePage = document.getElementById("home_page");
const searchPage = document.getElementById("search_page");
const searchCityInput = document.getElementsByTagName("input")[0];
const sections = document.getElementsByTagName("section");  // section
const citiesList = document.getElementById("cities_list");  // ul城市搜索列表
const current_city = document.getElementById("current_city");   // li
const recordList = document.getElementById("record_list");  // ul
const clearBtn = document.getElementById("clearBtn");
const hotCities = document.getElementById('hot_cities');    // ul

// GPS
navigator.geolocation.getCurrentPosition((pos) => {
    console.log(pos)
}, err => {
    console.log("请求位置失败", err)
})

// 跳转到主页
returnBtn.addEventListener("click", () => {
    searchPage.setAttribute("style", "display: none");
    homePage.setAttribute("style", "display: block");
})

// 搜索城市:
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
                innerContent += `<li><a data-id=${item.id}>${item.name}</a></li>`;
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
    }, { capture: true });
})

function selectCity(city, location) {
    updateCity(city, location);   // 更新——当前城市
    addRecord(city, location);    // 更新——添加记录
}

// 当前城市:
const updateCity = (city, location) => {
    console.log(location)
    localStorage.setItem('location', location)
    current_city.innerHTML = `<li><a data-id=${location}>city</a></li>`;
}

// 历史记录——1.热搜城市；2.搜索框:
const addRecord = (function () {
    let map;    // 闭包存储记录，去重
    return function (city) {
        if (!map) {
            map = {};
        }
        if (!map[city]) {
            map[city] = city;
            recordList.innerHTML += `<li><a data-id=>${city}</a></li>`;
        }
    }
})()

// 删除记录:
clearBtn.addEventListener("click", () => {
    recordList.innerHTML = "";
});

// 热搜城市:
ajax({
    url: "https://geoapi.qweather.com/v2/city/top",
    data: {key, range: "cn", number: 7},
})
    .then((data) => {
        const {topCityList} = data;
        let ulInner = "";
        topCityList.map(list => {
            ulInner += `<li><a id=${list.name} data-id=${list.location}>${list.name}</a></li>`;
        });
        hotCities.addEventListener("click", (e) => {
            if (e.target.nodeName === "A") {
                selectCity(e.target.innerText, e.target.getAttribute("data-id"));
            }
        }, { capture: true, });
        // 只渲染一次
        hotCities.innerHTML = ulInner;
    })