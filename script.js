const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const aboutSection = document.getElementById('aboutSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const mealForm = document.getElementById('mealForm');
const mealTableBody = document.getElementById('mealTableBody');
const totalCalories = document.getElementById('totalCalories');
const goalProgress = document.getElementById('goalProgress');
const calorieGoal = document.getElementById('calorieGoal');
const userNameDisplay = document.getElementById('userNameDisplay');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const aboutLink = document.getElementById('aboutLink');
const logoutLink = document.querySelectorAll('#logoutLink');
const editMealSection = document.getElementById('editMealSection');
const editMealForm = document.getElementById('editMealForm');
const updateGoalBtn = document.getElementById('updateGoalBtn');

let dailyCalories = 0;
let meals = [];
let user = null;
let calorieGoalValue = 2000;

const showSection = (sectionId) => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    aboutSection.style.display = 'none';
    editMealSection.style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
};

const updateGoalProgress = () => {
    const goal = calorieGoalValue;
    const progress = (dailyCalories / goal) * 100;
    goalProgress.textContent = `Goal Progress: ${progress.toFixed(2)}%`;
};

const renderMealTable = () => {
    mealTableBody.innerHTML = '';

    meals.forEach((meal, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = meal.name;
        row.appendChild(nameCell);

        const caloriesCell = document.createElement('td');
        caloriesCell.textContent = meal.calories;
        row.appendChild(caloriesCell);

        const actionsCell = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            showEditMealSection(meal, index);
        });
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            meals.splice(index, 1);
            dailyCalories -= meal.calories;
            totalCalories.textContent = `Total Calories: ${dailyCalories}`;
            updateGoalProgress();
            renderMealTable();
            saveUserData();
        });
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        mealTableBody.appendChild(row);
    });
};

const showEditMealSection = (meal, index) => {
    const { name, calories } = meal;
    document.getElementById('editMealName').value = name;
    document.getElementById('editCalories').value = calories;
    document.getElementById('editMealId').value = index;
    showSection('editMealSection');
};

const fetchCalorieInfo = async (query) => {
    try {
        // Replace this with your actual API endpoint and logic
        const response = await fetch(`/api/nutrition?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching calorie information:', error);
        return null;
    }
};

const saveUserData = async () => {
    if (!user) return;

    try {
        // Replace this with your actual API endpoint and logic
        const response = await fetch(`/api/users/${user.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meals, dailyCalories, calorieGoal: calorieGoalValue }),
        });

        if (!response.ok) {
            console.error('Failed to save user data');
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

const loadUserData = async () => {
    if (!user) return;

    try {
        // Replace this with your actual API endpoint and logic
        const response = await fetch(`/api/users/${user.username}`);
        const userData = await response.json();

        if (userData) {
            meals = userData.meals;
            dailyCalories = userData.dailyCalories;
            calorieGoalValue = userData.calorieGoal || 2000;
            calorieGoal.value = calorieGoalValue;
            totalCalories.textContent = `Total Calories: ${dailyCalories}`;
            updateGoalProgress();
            renderMealTable();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
};

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Replace this with your actual API endpoint and logic
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            user = { username };
            userNameDisplay.textContent = username;
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again later.');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        // Replace this with your actual API endpoint and logic
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: newUsername, password: newPassword }),
        });

        if (response.ok) {
            alert('Registration successful! You can now log in.');
            showSection('loginSection');
        } else {
            alert('Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again later.');
    }
});

mealForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const mealName = document.getElementById('mealName').value;
    const calorieInfo = await fetchCalorieInfo(mealName);

    if (calorieInfo) {
        const { name, calories } = calorieInfo;
        const meal = { name, calories };
        meals.push(meal);
        dailyCalories += calories;
        totalCalories.textContent = `Total Calories: ${dailyCalories}`;
        updateGoalProgress();
        renderMealTable();
        saveUserData();
    } else {
        alert('Unable to fetch calorie information for the provided meal name.');
    }

    mealForm.reset();
});

editMealForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editMealName = document.getElementById('editMealName').value;
    const editCalories = document.getElementById('editCalories').value;
    const editMealId = document.getElementById('editMealId').value;

    const meal = { name: editMealName, calories: parseFloat(editCalories) };
    meals[editMealId] = meal;

    dailyCalories = dailyCalories - meals[editMealId].calories + meal.calories;
    totalCalories.textContent = `Total Calories: ${dailyCalories}`;
    updateGoalProgress();
    renderMealTable();
    saveUserData();

    showSection('appSection');
});

updateGoalBtn.addEventListener('click', () => {
    calorieGoalValue = parseInt(calorieGoal.value);
    updateGoalProgress();
    saveUserData();
});

logoutLink.forEach((link) => {
    link.addEventListener('click', () => {
        user = null;
        meals = [];
        dailyCalories = 0;
        totalCalories.textContent = 'Total Calories: 0';
        goalProgress.textContent = 'Goal Progress: 0%';
        mealTableBody.innerHTML = '';
        window.location.href = 'index.html';
    });
});

loginLink.addEventListener('click', () => {
    showSection('loginSection');
});

registerLink.addEventListener('click', () => {
    showSection('registerSection');
});

aboutLink.addEventListener('click', () => {
    showSection('aboutSection');
});

// Check if the user is already logged in
const storedUser = localStorage.getItem('user');
if (storedUser) {
    user = JSON.parse(storedUser);
    userNameDisplay.textContent = user.username;
    window.location.href = 'dashboard.html';
} else {
    showSection('loginSection');
}