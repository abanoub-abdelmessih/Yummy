const searchInputs = document.getElementById('searchInputs');
const rowData = document.getElementById('rowData');
const searchContainer = document.getElementById('searchContainer');
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';
let lastSearchResults = '';

// ! Side Nav
$(document).ready(function() {
    $(".open-close-icon").click(function() {
        if ($(".nav").innerWidth() === 0) {
            openSideNav();
        } else {
            closeSideNav();
        }
    });
    searchByName("").then(() => {
        $("body").css("overflow", "visible");
        // Push initial state to history
        history.replaceState({ view: 'search', html: rowData.innerHTML }, '', '');
    });
});

function openSideNav() {
    $(".nav").animate({ width: '250px' }, 300, function() {
        $('.NavFooter').fadeIn(300);
        $(".open-close-icon").removeClass("fa-align-justify").addClass("fa-x");
        $(".navItems li").each(function(index) {
            $(this).delay(index * 50).animate({ opacity: 1, top: 0 }, 300);
        });
    });
}

function closeSideNav() {
    let itemsCount = $(".navItems li").length;
    $(".navItems li").each(function(index) {
        $(this).delay((itemsCount - index - 1) * 50).animate({ opacity: 0, top: '20px' }, 300, function() {
            if (index === itemsCount - 1) {
                $('.NavFooter').fadeOut(300, function() {
                    $(".nav").animate({ width: '0px' }, 300, function() {
                        $(".open-close-icon").removeClass("fa-x").addClass("fa-align-justify");
                    });
                });
            }
        });
    });
}

// ! Get data from API function
async function getData(endpoint) {
    try {
        let response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Error occurred: ' + error.message);
    }
}

// ! Search Inputs
function SearchInput() {
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        let searchContainer = `
            <div class="container p-5 d-flex gap-5 justify-content-between">
                <input type="text" class="form-control rounded-0 w-50 bg-transparent text-white" id="searchByName" placeholder="Search By name">
                <input type="text" class="form-control rounded-0 w-50 bg-transparent text-white" id="searchByFirstLetter" placeholder="Search By First letter" maxlength="1">
            </div>
        `;
        rowData.innerHTML = '';
        closeSideNav();
        searchInputs.innerHTML = searchContainer;
        
        $('#searchByName').on('input', function() {
            searchByName($(this).val());
        });
        $('#searchByFirstLetter').on('input', function() {
            searchByFirstLetter($(this).val());
        });
    
        // Push state to history
        history.pushState({ view: 'searchInput' }, '', '');
    });

    $('.loading-screen , .fa-spin').fadeOut(500);

}

async function searchByName(name) {
    let searchName = await getData(`search.php?s=${name}`);
    displaySearchResults(searchName.meals);
}

async function searchByFirstLetter(letter) {
    if (letter.trim() === '') {
        return;
    }
    try {
        let searchLetter = await getData(`search.php?f=${letter}`);
        displaySearchResults(searchLetter.meals);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displaySearchResults(meals) {
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        let searchResultHtml = '';
        if (meals) {
            meals.forEach(meal => {
                searchResultHtml += `
                    <div class="col-lg-3">
                        <div class="searchCard rounded-3 position-relative overflow-hidden pointer" data-mealid="${meal.idMeal}">
                            <img src="${meal.strMealThumb}" class="w-100" alt="${meal.strMeal}">
                            <div class="searchLayer bg-light bg-opacity-75 text-black d-flex align-items-center p-3">
                                <p class="h1">${meal.strMeal}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            searchResultHtml = '<p>No meals found</p>';
        }
        rowData.innerHTML = searchResultHtml;
        lastSearchResults = searchResultHtml;  // Store the last search results
    
        // Add click event handler to dynamically created .searchCard elements
        $('.searchCard').on('click', function() {
            const mealId = $(this).data('mealid');
            getElementId(mealId);
        });
    
        // Push state to history
        history.pushState({ view: 'search', html: searchResultHtml }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);

}

// ! Get Categories Data Function
async function allCategories() {
    let categoriesData = await getData('categories.php'); 
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        closeSideNav();
        searchInputs.innerHTML = '';
        rowData.innerHTML = '';
        categoriesData.categories.forEach(category => {
            let categoryCard = `
                <div class="col-lg-3 mb-3 d-flex justify-content-center">
                    <div class="categoriesCard position-relative overflow-hidden pointer rounded-3" data-category="${category.strCategory}">
                        <img src="${category.strCategoryThumb}" class="w-100" alt="${category.strCategory}">
                        <div class="categoriesLayer bg-light bg-opacity-75 text-black d-flex justify-content-center align-items-center flex-column p-3">
                            <h3>${category.strCategory}</h3>
                            <p>${category.strCategoryDescription.substring(0, 60)}...</p>
                        </div>
                    </div>
                </div>
            `;
            rowData.innerHTML += categoryCard;
        });
    
        // Add click event listener to category cards
        $('.categoriesCard').on('click', function() {
            const category = $(this).data('category');
            getCategoryMeals(category);
        });
    
        // Push state to history
        history.pushState({ view: 'categories' }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);

}

// ! Get meals by Category Function
async function getCategoryMeals(category) {
    let mealsData = await getData(`filter.php?c=${category}`);
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        rowData.innerHTML = '';
        mealsData.meals.slice(0, 20).forEach(meal => {
            let mealCard = `
                <div class="col-lg-3">
                    <div class="searchCard rounded-3 position-relative overflow-hidden pointer" data-mealid="${meal.idMeal}">
                        <img src="${meal.strMealThumb}" class="w-100" alt="${meal.strMeal}">
                        <div class="searchLayer bg-light bg-opacity-75 text-black d-flex align-items-center p-3">
                            <p class="h1">${meal.strMeal}</p>
                        </div>
                    </div>
                </div>
            `;
            rowData.innerHTML += mealCard;
        });
    
        // Add click event handler to dynamically created .searchCard elements
        $('.searchCard').on('click', function() {
            const mealId = $(this).data('mealid');
            getElementId(mealId);
        });
    
        // Push state to history
        history.pushState({ view: 'categoryMeals', category: category }, '', '');

    });
    $('.loading-screen , .fa-spin').fadeOut(500);

}

async function displayCategoryMeals(category) {
    let categoryMeals = await getData(`filter.php?c=${category}`);
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        searchInputs.innerHTML = '';
        rowData.innerHTML = '';
    
        categoryMeals.meals.forEach(meal => {
            let mealCard = `
                <div class="col-lg-3 mb-3 d-flex justify-content-center">
                    <div class="mealCard position-relative overflow-hidden pointer rounded-3" data-mealid="${meal.idMeal}">
                        <img src="${meal.strMealThumb}" class="w-100" alt="${meal.strMeal}">
                        <div class="mealLayer bg-light bg-opacity-75 text-black d-flex justify-content-center align-items-center flex-column p-3">
                            <h3>${meal.strMeal}</h3>
                        </div>
                    </div>
                </div>
            `;
            rowData.innerHTML += mealCard;
        });
    
        // Add event listeners to meal cards
        $('.mealCard').on('click', function() {
            const mealId = $(this).data('mealid');
            getElementId(mealId);
        });
    
        // Push state to history
        history.pushState({ view: 'categoryMeals', category: category }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);


}

// ! Get Area Data Function
async function getArea() {
    let areaData = await getData('list.php?a=list');
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        closeSideNav();
        searchInputs.innerHTML = '';
        rowData.innerHTML = '';
        areaData.meals.forEach(meal => {
            let areaCard = `
            <div class="col-md-3 text-center fs-1 pointer" data-area="${meal.strArea}">
                <i class="fa-solid fa-house-laptop"></i>
                <p>${meal.strArea}</p>
            </div>
            `;
            rowData.innerHTML += areaCard;
        });
    
        // Add click event listener to area cards
        $('.col-md-3[data-area]').on('click', function() {
            const area = $(this).data('area');
            getMealsByArea(area);
        });
    
        // Push state to history
        history.pushState({ view: 'area' }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);
}
// ! Get meals by Area Function
async function getMealsByArea(area) {
    let mealsData = await getData(`filter.php?a=${area}`);
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        rowData.innerHTML = '';
        mealsData.meals.slice(0, 20).forEach(meal => {
            let mealCard = `
                <div class="col-lg-3">
                    <div class="searchCard rounded-3 position-relative overflow-hidden pointer" data-mealid="${meal.idMeal}">
                        <img src="${meal.strMealThumb}" class="w-100" alt="${meal.strMeal}">
                        <div class="searchLayer bg-light bg-opacity-75 text-black d-flex align-items-center p-3">
                            <p class="h1">${meal.strMeal}</p>
                        </div>
                    </div>
                </div>
            `;
            rowData.innerHTML += mealCard;
        });
    
        // Add click event handler to dynamically created .searchCard elements
        $('.searchCard').on('click', function() {
            const mealId = $(this).data('mealid');
            getElementId(mealId);
        });
    
        // Push state to history
        history.pushState({ view: 'areaMeals', area: area }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);

}

// ! Get Ingredients Data Function
async function getIngredients() {
    let IngredientsData = await getData('list.php?i=list');
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        closeSideNav();
        searchInputs.innerHTML = '';
        rowData.innerHTML = '';
        IngredientsData.meals.slice(0, 20).forEach(ingredient => {
            let ingredientCard = `
                <div class="col-md-3 text-center fs-1 pointer" data-ingredient="${ingredient.strIngredient}">
                    <i class="fa-solid fa-drumstick-bite"></i>
                    <p class="m-0">${ingredient.strIngredient}</p>
                    <p class="fs-6">${ingredient.strDescription.substring(0, 100)}</p>
                </div>
            `;
            rowData.innerHTML += ingredientCard;
        });
    
        // Add click event listener to ingredient cards
        $('.col-md-3[data-ingredient]').on('click', function() {
            const ingredient = $(this).data('ingredient');
            getMealsByIngredient(ingredient);
        });
    
        // Push state to history
        history.pushState({ view: 'ingredients' }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);

}
// ! Get meals by Ingredient Function
async function getMealsByIngredient(ingredient) {
    let mealsData = await getData(`filter.php?i=${ingredient}`);
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        rowData.innerHTML = '';
        mealsData.meals.slice(0, 20).forEach(meal => {
            let mealCard = `
                <div class="col-lg-3">
                    <div class="searchCard rounded-3 position-relative overflow-hidden pointer" data-mealid="${meal.idMeal}">
                        <img src="${meal.strMealThumb}" class="w-100" alt="${meal.strMeal}">
                        <div class="searchLayer bg-light bg-opacity-75 text-black d-flex align-items-center p-3">
                            <p class="h1">${meal.strMeal}</p>
                        </div>
                    </div>
                </div>
            `;
            rowData.innerHTML += mealCard;
        });
    
        // Add click event handler to dynamically created .searchCard elements
        $('.searchCard').on('click', function() {
            const mealId = $(this).data('mealid');
            getElementId(mealId);
        });
    
        // Push state to history
        history.pushState({ view: 'ingredientMeals', ingredient: ingredient }, '', '');
    });
    $('.loading-screen , .fa-spin').fadeOut(500);
}


// ! Show Contact Function
function contactUS() {
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        closeSideNav();
        rowData.innerHTML = `<div class="contact min-vh-100 d-flex justify-content-center align-items-center">
        <div class="container w-75 text-center">
            <div class="row g-4">
                <div class="col-md-6">
                    <input id="nameInput" onkeyup="inputsValidation()" type="text" class="form-control" placeholder="Enter Your Name">
                    <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Special characters and numbers not allowed
                    </div>
                </div>
                <div class="col-md-6">
                    <input id="emailInput" onkeyup="inputsValidation()" type="email" class="form-control " placeholder="Enter Your Email">
                    <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Email not valid *exemple@yyy.zzz
                    </div>
                </div>
                <div class="col-md-6">
                    <input id="phoneInput" onkeyup="inputsValidation()" type="text" class="form-control " placeholder="Enter Your Phone">
                    <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Enter valid Phone Number
                    </div>
                </div>
                <div class="col-md-6">
                    <input id="ageInput" onkeyup="inputsValidation()" type="number" class="form-control " placeholder="Enter Your Age">
                    <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Enter valid age
                    </div>
                </div>
                <div class="col-md-6">
                    <input  id="passwordInput" onkeyup="inputsValidation()" type="password" class="form-control " placeholder="Enter Your Password">
                    <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Enter valid password *Minimum eight characters, at least one letter and one number:*
                    </div>
                </div>
                <div class="col-md-6">
                    <input  id="repasswordInput" onkeyup="inputsValidation()" type="password" class="form-control " placeholder="Repassword">
                    <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Enter valid repassword 
                    </div>
                </div>
            </div>
            <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3">Submit</button>
        </div>
    </div> `
        submitBtn = document.getElementById("submitBtn")
    
    
        document.getElementById("nameInput").addEventListener("focus", () => {
            nameInputTouched = true
        })
    
        document.getElementById("emailInput").addEventListener("focus", () => {
            emailInputTouched = true
        })
    
        document.getElementById("phoneInput").addEventListener("focus", () => {
            phoneInputTouched = true
        })
    
        document.getElementById("ageInput").addEventListener("focus", () => {
            ageInputTouched = true
        })
    
        document.getElementById("passwordInput").addEventListener("focus", () => {
            passwordInputTouched = true
        })
    
        document.getElementById("repasswordInput").addEventListener("focus", () => {
            repasswordInputTouched = true
        })
    });
    $('.loading-screen , .fa-spin').fadeOut(500);
}

let nameInputTouched = false;
let emailInputTouched = false;
let phoneInputTouched = false;
let ageInputTouched = false;
let passwordInputTouched = false;
let repasswordInputTouched = false;




function inputsValidation() {
    if (nameInputTouched) {
        if (nameValidation()) {
            document.getElementById("nameAlert").classList.replace("d-block", "d-none")

        } else {
            document.getElementById("nameAlert").classList.replace("d-none", "d-block")

        }
    }
    if (emailInputTouched) {

        if (emailValidation()) {
            document.getElementById("emailAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("emailAlert").classList.replace("d-none", "d-block")

        }
    }

    if (phoneInputTouched) {
        if (phoneValidation()) {
            document.getElementById("phoneAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("phoneAlert").classList.replace("d-none", "d-block")

        }
    }

    if (ageInputTouched) {
        if (ageValidation()) {
            document.getElementById("ageAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("ageAlert").classList.replace("d-none", "d-block")

        }
    }

    if (passwordInputTouched) {
        if (passwordValidation()) {
            document.getElementById("passwordAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("passwordAlert").classList.replace("d-none", "d-block")

        }
    }
    if (repasswordInputTouched) {
        if (repasswordValidation()) {
            document.getElementById("repasswordAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("repasswordAlert").classList.replace("d-none", "d-block")

        }
    }


    if (nameValidation() &&
        emailValidation() &&
        phoneValidation() &&
        ageValidation() &&
        passwordValidation() &&
        repasswordValidation()) {
        submitBtn.removeAttribute("disabled")
    } else {
        submitBtn.setAttribute("disabled", true)
    }
}

function nameValidation() {
    return (/^[a-zA-Z ]+$/.test(document.getElementById("nameInput").value))
}

function emailValidation() {
    return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(document.getElementById("emailInput").value))
}

function phoneValidation() {
    return (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(document.getElementById("phoneInput").value))
}

function ageValidation() {
    return (/^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/.test(document.getElementById("ageInput").value))
}

function passwordValidation() {
    return (/^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/.test(document.getElementById("passwordInput").value))
}

function repasswordValidation() {
    return document.getElementById("repasswordInput").value == document.getElementById("passwordInput").value
}

// ! Display Meal Details
async function getElementId(mealId) {
    let mealData = await getData(`lookup.php?i=${mealId}`);
    displayMealDetails(mealData.meals[0]);

    // Push state to history
    history.pushState({ view: 'mealDetail', mealId: mealId }, '', '');
}

function displayMealDetails(meal) {
    $('.loading-screen , .fa-spin').fadeIn(500 , function(){
        searchContainer.innerHTML = "";
    
        let ingredients = ``;
    
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                ingredients += `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</li>`;
            }
        }
    
        let tags = meal.strTags?.split(",")
        if (!tags) tags = []
    
        let tagsStr = ''
        for (let i = 0; i < tags.length; i++) {
            tagsStr += `
            <li class="alert alert-danger m-2 p-1">${tags[i]}</li>`;
        }
    
        let cartoona = `
        <div class="col-md-4">
                    <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="">
                        <h2>${meal.strMeal}</h2>
                </div>
                <div class="col-md-8">
                    <h2>Instructions</h2>
                    <p>${meal.strInstructions}</p>
                    <h3><span class="fw-bolder">Area : </span>${meal.strArea}</h3>
                    <h3><span class="fw-bolder">Category : </span>${meal.strCategory}</h3>
                    <h3>Recipes :</h3>
                    <ul class="list-unstyled d-flex g-3 flex-wrap">
                        ${ingredients}
                    </ul>
    
                    <h3>Tags :</h3>
                    <ul class="list-unstyled d-flex g-3 flex-wrap">
                        ${tagsStr}
                    </ul>
    
                    <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
                    <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
                </div>`;
    
        rowData.innerHTML = cartoona;
    });
    $('.loading-screen , .fa-spin').fadeOut(500);

}

// ! Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state) {
        switch (event.state.view) {
            case 'search':
                rowData.innerHTML = event.state.html;
                lastSearchResults = event.state.html;
                attachSearchCardClickHandlers();
                break;
            case 'mealDetail':
                getElementId(event.state.mealId);
                break;
            case 'areaMeals':
                getMealsByArea(event.state.area);
                break;
            case 'ingredientMeals':
                getMealsByIngredient(event.state.ingredient);
                break;
            case 'categories':
                allCategories();
                break;
            case 'categoryMeals':
                displayCategoryMeals(event.state.category);
                break;
            case 'contact':
                contactUS();
                break;
            default:
                console.warn('Unknown state:', event.state.view);
        }
    }
});

function attachSearchCardClickHandlers() {
    $('.searchCard').off('click').on('click', function() {
        const mealId = $(this).data('mealid');
        getElementId(mealId);
    });
}


