    // global variable have current page path
    const global = {
        currentPage: window.location.pathname
    }
    let mealName;
    let favMealList = [];
    let queryParam;
    let mealsFromDB;
    // Highlight active nav link
    function highlightActiveLink(){
        const links = document.querySelectorAll('.nav-link');
        const currentPage = global.currentPage.split('/')[3];
        links.forEach(link => {
            if(link.getAttribute('href') == currentPage){
                link.classList.add('active');
            }else{
                link.classList.remove('active');
            }
        });
    }
    
    // To fetch meal data from API url using meal name as search parameter
    async function fetchMealData(mealName){
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`)
            const meal = await response.json();
            return meal;
        } catch (error) {
            console.log("Error ",error)
        }
    }
    
    // Function to handle all the click events
    async function handleclick(e){
        try {
            if(e.target.parentElement.id == 'search-btn'){
                const mealName = document.getElementById('search-meal').value;
                const mealsObj = await fetchMealData(mealName);
                sessionStorage.setItem('mealName',JSON.stringify(mealName))
                displayMeals(mealsObj.meals)
            }else if(e.target.classList.contains('delete')){
                let id = e.target.parentElement.id;
                deleteMeal(id);
                showNotification('deleted','Meal deleted');
                removeShowNotificationDiv('.deleted');
            }else if(e.target.parentElement.id == 'delete-all'){
                deleteAllFavMeal();
                if(alert('Are you sure!')){
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    
    // Function to display searched meal
    async function displayMeals(meals){
        try {
            if(meals == null){
                const mealName = JSON.parse(sessionStorage.getItem('mealName'))
                const mealObj = await fetchMealData(mealName)
                meals = mealObj.meals;
            }
            if(meals != null){
                let val = '';
                meals.forEach((meal) => {
                    val += `
                        <a href="MealDetails.html?name=${meal.idMeal}">
                            <div class="card text-center">
                                <div class="card-img">
                                    <img src=${meal.strMealThumb} alt="meal-img">
                                </div>
                                <div class="card-content">
                                    <h2>${meal.strMeal}</h2>
                                    <p>Cusine: ${meal.strArea}</p>
                                    <p>Category: ${meal.strCategory}</p>
                                </div>
                                <button type="button" class="fav-btn" data-mealId=${meal.idMeal}><i class="fa fa-bookmark"></i></button>
                            </div>
                        </a>
                    `
                })
                
                document.getElementById('display-meal').innerHTML = val;
                const favBtn = document.querySelectorAll('#display-meal .fav-btn');
                
                for(let i = 0;i<favBtn.length;i++){
                    const mealId = favBtn[i].getAttribute('data-mealId');
                    favMealList.forEach(item => {
                        if(item.split(',')[0] == mealId){
                            favBtn[i].classList.add('active');
                        }
                    })
                    favBtn[i].addEventListener('click',async function(e){
                        e.preventDefault()
                        if(checkMealInFavMealsList(mealId)){
                            e.target.parentElement.classList.add('active')
                            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
                            const meal = await response.json();
                            const [ mealData ] = meal.meals;
                            favMealList.push(mealId+','+mealData.strMeal+','+mealData.strMealThumb);
                            localStorage.setItem('fav-meal',JSON.stringify(favMealList));
                            showNotification('added','Meal added')
                            removeShowNotificationDiv('.added')
                        }
                    })
                }
            }
        }catch (error) {
            console.log("Error",error)
        }
    }
//  Checking meal in favourite meal list
    function checkMealInFavMealsList(mealId){
        let flag = true;
        favMealList.forEach(meal => {
            if(mealId == meal.split(',')[0]){
                console.log("meal already saved to my fav list")
                showNotification('added','Meal already added')
                removeShowNotificationDiv('.added')
                flag = false;
            }
        })
        return flag;
    }
    
    // Function to display meal details
    async function MealDetails(){
        try {
            const mealId = window.location.search.split('=')[1];
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const meal = await response.json();
            const [ mealDetails ] = meal.meals;
            document.getElementById('meal-details').innerHTML = `
                <div class="meal-img">
                    <img src= ${mealDetails.strMealThumb} alt="meal-img">
                </div>
                <div class="meal-details-text text-center">
                    <h2>${mealDetails.strMeal}</h2>
                    <div>
                        <p>Cusine: ${mealDetails.strArea}</p>
                        <p>Category: ${mealDetails.strCategory}</p>
                    </div>
                    <h3>Ingredients & Measures</h3>
                    <p>
                        ${mealDetails.strIngredient1} - ${mealDetails.strMeasure1}, ${mealDetails.strIngredient2} - ${mealDetails.strMeasure2},
                        ${mealDetails.strIngredient3} - ${mealDetails.strMeasure3}, ${mealDetails.strIngredient4} - ${mealDetails.strMeasure4},
                        ${mealDetails.strIngredient5} - ${mealDetails.strMeasure5}, ${mealDetails.strIngredient6} - ${mealDetails.strMeasure6},
                        ${mealDetails.strIngredient7} - ${mealDetails.strMeasure7}, ${mealDetails.strIngredient8} - ${mealDetails.strMeasure8},
                    </p>
                </div>
            `
            document.getElementById('meal-instruction').innerHTML = `Instructions: ${mealDetails.strInstructions}`
        } catch (error) {
            console.log("Error-",error)
        }
    }
    
    // Function to display favourite meals
    function favouriteMeals(){
        mealsFromDB = JSON.parse(localStorage.getItem('fav-meal'));
        let mealList = '';
        if(mealsFromDB !== null){
            mealsFromDB.forEach(meal =>{
                const mealId = meal.split(',')[0];
                mealList += `
                <div style="background:url(${meal.split(',')[2]}) no-repeat center center; background-size: contains;">
                    <li class="meal-item" id=${mealId} data-mealImg=${meal.split(',')[2]}>
                    ${meal.split(',')[1]}
                    </li>
                    <span id=${mealId}><i class="fa fa-times delete"></i></span>
                </div>
                `
            })
            // console.log(mealList)
            document.querySelector('#fav-meal-list').innerHTML = mealList;
        }
    }
    // Function to get Favourite meals from local storage
    function getFavourteMeals(){
        mealsFromDB = JSON.parse(localStorage.getItem('fav-meal'))
        if(mealsFromDB !== null){
            mealsFromDB.forEach(meal => {
                favMealList.push(meal)
            })
        }
    }
    
    // Function to delete meal
    function deleteMeal(id){
        let mealList = document.querySelectorAll('.meal-item')
        mealList = Array.from(mealList);
        const newList = mealList.filter((meal) => {
           return meal.id !== id
        });
        console.log(mealList)
        favMealList = [];
        newList.map(list =>{
            let data = `${list.id},${list.textContent},${list.getAttribute('data-mealimg')}`;
            favMealList.push(data.toString());
        })
        console.log(newList)
        localStorage.clear()
        localStorage.setItem('fav-meal',JSON.stringify(favMealList));
        favouriteMeals()
    }
    // Function to show notification
    function showNotification(className,msg){
        const div = document.createElement('div');
        div.className = `${className}`
        div.innerHTML = `
            <p>
                ${msg}
            </p>
            <p class=${className==='added'?'green':'red'}></p>
        `
        const parentDiv = document.querySelector(`${className == 'added'? 'main':'#favourite-meals'}`)
        parentDiv.insertBefore(div, document.querySelector(`${className == 'added'? '#search-bar':'.title'}`))
    }
    // Delete all favourite meals
    function deleteAllFavMeal(){
        let mealList = document.querySelectorAll('#favourite-meals div');
        mealList.forEach(item =>{
            item.remove();
        })
        localStorage.clear('fav-meal');
    }
    // Function to remove notification
    function removeShowNotificationDiv(className){
        setTimeout(() => {
            document.querySelector(className).remove()
        },1000)
    }
    
    document.addEventListener('click',handleclick);
    // document.addEventListener('keyup',handleSearch)
    // Function to route meal app pages when dom load
    function init(){
        switch(global.currentPage){
            case '/home':
                console.log('Home Page');
                getFavourteMeals()
                displayMeals()
                break;
            case '/mealdetails':
                console.log('Meal Detail page');
                MealDetails();
                break;
            case '/favmeal':
                console.log('Favourte Meal page');
                favouriteMeals()
                break;
        }
        highlightActiveLink();
        // fetchMealList();
        // fetchMealData();
    }
    
    document.addEventListener('DOMContentLoaded',init);
