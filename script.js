$(document).ready(function () {

  $('#getEnteredCityWeather,#past-history').on('click', function () {

        let click_event = $(event.target)[0];
        let location = "";
        if (click_event.id === "getEnteredCityWeather") {
          location = $('#city_input').val().trim().toUpperCase();
        } else if ( click_event.className === ("all_city") ) {
          location = click_event.innerText;
        }
        if (location == "") return;

        updateLocalStorage (location);
        
        getCurrentWeather(location);
        
        getForecastWeather(location);
       });

    function convertDate(u_time_stamp) {
      let convertedDate = "";
      let a = new Date(u_time_stamp * 1000);
      let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      let year = a.getFullYear();
      let month = months[a.getMonth()];
      let date = a.getDate();
      convertedDate = month + ' ' + date + ', '+ year;
      return convertedDate;
    }

    function updateLocalStorage(location) {
       let all_city = JSON.parse(localStorage.getItem("all_city")) || [];
       all_city.push(location); 
       all_city.sort();

       for (let i=1; i<all_city.length; i++) {
           if (all_city[i] === all_city[i-1]) all_city.splice(i,1);
       }
       localStorage.setItem('all_city', JSON.stringify(all_city));

       $('#city_input').val("");
    }

    function establishCurrLocation() {
        
        let location = {};
        
        function success(position) {
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            success: true
          }
      
          getCurrentWeather(location);
      
          getForecastWeather(location);
        }
        function error() {
          location = { success: false }
          return location;
        }
      
        if (!navigator.geolocation) {
          console.log('Location is invalid');
        } else {
          navigator.geolocation.getCurrentPosition(success, error);
        }
      }

    function getCurrentWeather(loc) {
        
        let all_city = JSON.parse(localStorage.getItem("all_city")) || [];
        
        $('#past-history').empty();
        
        all_city.forEach ( function (city) {  
          let cityHistoryNameDiv = $('<div>');      
          cityHistoryNameDiv.addClass("all_city");         
          cityHistoryNameDiv.attr("value",city);
          cityHistoryNameDiv.text(city);
          $('#past-history').append(cityHistoryNameDiv);
        });      
        
        $('#city-search').val("");
      
        if (typeof loc === "object") {
          city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
          city = `q=${loc}`;
        }
      
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "3acd80bef7e77f835294b0a3493088a1";
        var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;
      
        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
      
        weather_obj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: Math.round(response1.main.temp),
      
            date: (convertDate(response1.dt)),
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
        }
        
          $('#forecast').empty(); 
          $('#cityName').text(weather_obj.city + " (" + weather_obj.date + ")");          // render the current search city weather icon
          $('#currWeathIcn').attr("src", weather_obj.icon);
          $('#currTemp').text("Temperature: " + weather_obj.temp + " " +  "°F");
          $('#currHum').text("Humidity: " + weather_obj.humidity + "%");
          $('#currWind').text("Windspeed: " + weather_obj.wind + " MPH");      

          city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;
        
        var appURL = "https://api.openweathermap.org/data/2.5/uvi";
        var apiIdURL = "?appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var cityName = city;
        var open_weather_API = appURL + apiIdURL + apiKey + cityName;
        
        $.ajax({
            url: open_weather_API,
            method: "GET"
        }).then(function(response3) {
        
            let level = parseFloat(response3.value);
          
            let bg_color = 'violet';        
            if (level < 3) {bg_color = 'green';} 
                else if (level < 6) { bg_color = 'yellow';} 
                else if (level < 8) { bg_color = 'orange';} 
                else if (level < 11) {bg_color = 'red';}     
        
            let title = '<span>UV Index: </span>';
            let color = title + `<span style="background-color: ${bg_color}; padding: 0 7px 0 7px;">${response3.value}</span>`;
            $('#current').html(color);            
            });
        });
    }

    function getForecastWeather(loc) {

        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;      
        } else {
            city = `q=${loc}`; }
        
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;
        
        $.ajax({
            url: openCurrWeatherAPI2,
            method: "GET",
        }).then(function (response4) {

        var city_lon = response4.coord.lon;
        var city_lat = response4.coord.lat;
        
        city = `lat=${city_lat}&lon=${city_lon}`;
        
        let weather_arr = [];
        let weather_obj = {};

        var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
        var cityName = city;
        
        var exclHrlURL = "&exclude=hourly";
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid=";
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;

        $.ajax({
            url: openFcstWeatherAPI,
            method: "GET"
        }).then(function (response2) {
        
          for (let i=1; i < (response2.daily.length-2); i++) {
            let cur = response2.daily[i]
            weather_obj = {
                weather: cur.weather[0].description,
                icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                min_temp: Math.round(cur.temp.min),
                max_temp: Math.round(cur.temp.max),
                humidity: cur.humidity,
                uvi: cur.uvi,
         
                date: (convertDate(cur.dt))
            }
            weather_arr.push(weather_obj);
          }
          for (let i = 0; i < weather_arr.length; i++) {
            let $colmx1 = $('<div class="col mx-1">');
            let $cardBody = $('<div class="card-body forecast-card">');
            let $cardTitle = $('<h6 class="card-title">');
           
            $cardTitle.text(weather_arr[i].date);

            let $ul = $('<ul>'); 
         
            let $iconLi = $('<li>');
            let $iconI = $('<img>');
            let $weathLi = $('<li>');
            let $tempMaxLi = $('<li>');
            let $tempMinLi = $('<li>');
            let $humLi = $('<li>');

            $iconI.attr('src', weather_arr[i].icon);
            $weathLi.text(weather_arr[i].weather);                
            $tempMaxLi.text('Temp High: ' + weather_arr[i].max_temp + " °F");
            $tempMinLi.text('Temp Low: ' + weather_arr[i].min_temp + " °F");
            $humLi.text('Humidity: ' + weather_arr[i].humidity + "%");

            $iconLi.append($iconI);
            $ul.append($iconLi);
            $ul.append($weathLi);         
            $ul.append($tempMaxLi);
            $ul.append($tempMinLi);
            $ul.append($humLi);
            $cardTitle.append($ul);
            $cardBody.append($cardTitle);
            $colmx1.append($cardBody);

            $('#forecast').append($colmx1);
          }
        });
      });        
    }
    

    var location = establishCurrLocation();
  });