
    // global variable have current page path
    const global = {
        currentPage: window.location.pathname
    }
    let mealName;
    let nameList = [];
    
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
            if(e !== undefined && e.target.classList.contains('delete')){
                let id = e.target.parentElement.id;
                deleteMeal(id);
                showNotification('deleted','Meal deleted');
                removeShowNotificationDiv('.deleted');
            }else if(e!== undefined && e.target.parentElement.id == 'search-btn'){
                const mealName = document.getElementById('search-meal').value;
                const meal = await fetchMealData(mealName);
                const [mealData] = meal.meals;
                sessionStorage.setItem('mealName',JSON.stringify(mealName))
                displayMeal(mealData,mealName)
            }else{
                const mealName = JSON.parse(sessionStorage.getItem('mealName'))
                const meal = await fetchMealData(mealName)
                const [mealData] = meal.meals;
                displayMeal(mealData,mealName)
            }
        } catch (error) {
            console.log(error)
        }
    }
    
    // Function to display searched meal
    async function displayMeal(mealData,mealName){
        try {
            mealData = mealData == null? JSON.parse(sessionStorage.getItem('mealData')):mealData;
            if(mealData != null){
                document.getElementById('display-meal').innerHTML =  `
                <a href="MealDetails.html?name=${mealName}">
                    <div class="card text-center">
                        <div class="card-img">
                            <img src=${mealData.strMealThumb} alt="meal-img">
                        </div>
                        <div class="card-content">
                            <h2>${mealData.strMeal}</h2>
                            <p>Cusine: ${mealData.strArea}</p>
                            <p>Category: ${mealData.strCategory}</p>
                        </div>
                        <button type="button" class="fav-btn"><i class="fa fa-bookmark"></i></button>
                    </div>
                </a>
                `
                const favBtn = document.querySelector('.fav-btn')
                nameList.forEach(meal => {
                    if(mealData.idMeal == meal.split(',')[0]){
                        console.log("meal already saved to my fav list")
                        favBtn.classList.add('active')
                    }
                })
                favBtn.addEventListener('click',function(e){
                    e.preventDefault()
                    e.target.parentElement.classList.add('active');
                    nameList.push(`${mealData.idMeal},${mealData.strMeal}`);
                    localStorage.setItem('fav-meal',JSON.stringify(nameList));
                    showNotification('added','Meal added')
                    removeShowNotificationDiv('.added')
                })
            }else{

            }
        }catch (error) {
            console.log("Error",error)
        }
    
            // document.getElementById('diplay-meal').innerHTML = `
            //     <ul class="meal-list">
            //         ${meals.forEach((meal) => {
            //             `<li class="card text-center">
            //                 <div class="card-img">
            //                     <img src=${meal.strMealThumb} alt="meal-img">
            //                 </div>
            //                 <div class="card-content">
            //                     <h2>${meal.strMeal}</h2>
            //                     <p>Cusine: ${meal.strArea}</p>
            //                     <p>Category: ${meal.strCategory}</p>
            //                 </div>
            //             </li>`
            //         }).join('')}
            //     </ul>
            // `
    }
    
    // Function to display meal details
    async function MealDetails(){
        try {
            mealName = window.location.search.split('=')[1];
            const meal = await fetchMealData(mealName);
            const [ mealData ] = meal.meals;
            document.getElementById('meal-details').innerHTML = `
                <div class="meal-img">
                    <img src= ${mealData.strMealThumb} alt="meal-img">
                </div>
                <div class="meal-details-text text-center">
                    <h2>${mealData.strMeal}</h2>
                    <div>
                        <p>Cusine: ${mealData.strArea}</p>
                        <p>Category: ${mealData.strCategory}</p>
                    </div>
                    <h3>Ingredients & Measures</h3>
                    <p>
                        ${mealData.strIngredient1} - ${mealData.strMeasure1}, ${mealData.strIngredient2} - ${mealData.strMeasure2},
                        ${mealData.strIngredient3} - ${mealData.strMeasure3}, ${mealData.strIngredient4} - ${mealData.strMeasure4},
                        ${mealData.strIngredient5} - ${mealData.strMeasure5}, ${mealData.strIngredient6} - ${mealData.strMeasure6},
                        ${mealData.strIngredient7} - ${mealData.strMeasure7}, ${mealData.strIngredient8} - ${mealData.strMeasure8},
                    </p>
                </div>
            `
            document.getElementById('meal-instruction').innerHTML = `Instructions: ${mealData.strInstructions}`
        } catch (error) {
            console.log("Error-",error)
        }
    }
    
    // Function to display favourite meals
    function favouriteMeals(){
        const meals = JSON.parse(localStorage.getItem('fav-meal'));
        if(meals !== null){
            document.querySelector('.fav-list').innerHTML = `
                <div>
                    ${meals.map(meal => `<li class="meal-item" id=${meal.split(',')[0]}>${meal.split(',')[1]}<i class="fa fa-times delete"></i></li>`).join('')}
                </div>
            `
        }
    }
    // Function to get Favourite meals from local storage
    function getFavourteMeals(){
        const mealName = JSON.parse(localStorage.getItem('fav-meal'))
        if(mealName !== null){
            mealName.forEach(meal => {
                nameList.push(meal)
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
        nameList = [];
        newList.map(list =>{
            let data = `${list.id},${list.textContent}`;
            nameList.push(data.toString());
        })
        localStorage.clear()
        localStorage.setItem('fav-meal',JSON.stringify(nameList));
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
                handleclick()
                break;
            case '/MealDetails':
                console.log('Meal Detail page');
                MealDetails();
                break;
            case '/FavMeal':
                console.log('Favourte Meal page');
                favouriteMeals()
                break;
        }
        highlightActiveLink();
        // fetchMealList();
        // fetchMealData();
    }
    
    document.addEventListener('DOMContentLoaded',init);
