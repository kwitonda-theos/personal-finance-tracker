const balance = document.querySelector('.balance');
const income =document.querySelector('.income-tab');
const expenses =document.querySelector('.expenses-tab');
const dashboard =document.querySelector('.Dashboard-tab');
const forms = document.querySelectorAll('.form-section');
const incomeSection  = document.querySelector('.income-section');
const expensesSection = document.querySelector('.expenses-section');
const incomeRows = document.querySelector('.income-table tbody');
const expensesRows = document.querySelector('.expenses-table tbody');
// inputs
const dateInput = document.querySelector('.expenses-date-input');
const descriptionInput = document.querySelector('.expenses-description-input');
const amountInput = document.querySelector('.expenses-amount-input');

const incomeDateInput = document.querySelector('.income-date-input');
const incomeDescriptionInput = document.querySelector('.income-description-input');
const incomeAmountInput = document.querySelector('.income-amount-input');
// submits
const expensesSubmitBtn = document.querySelector('.expenses-submit');

const incomeSubmitBtn = document.querySelector('.income-submit');

// Add event listeners to the tabs
income.addEventListener('click', () => {
    for (let form of forms) {
        form.style.display = 'none'; // Hide all forms
    }
    incomeSection.style.display = 'block'; // Show income form
    expensesSection.style.display = 'none'; // Hide expenses form
})
expenses.addEventListener('click', () => {
    for (let form of forms) {
        form.style.display = 'none'; // Hide all forms
    }
    expensesSection.style.display = 'block'; // Show expenses form
    incomeSection.style.display = 'none'; // Hide income form
    
})
dashboard.addEventListener('click', () => {
    for (let form of forms) {
        form.style.display = 'block'; 
    }
    incomeSection.style.display = 'none';
    expensesSection.style.display = 'none'; // Hide income form
    
})


// classes to store information from the forms
class Expense {
    constructor(date, description, amount, ) {
        
        this.date = date;
        this.description = description;
        this.amount = amount;
    }
    
    display() {
        return `
                    <td>${this.date}</td>
                    <td>${this.description}</td>
                    <td>${this.amount}</td>
                `;
    }
}
class Income {
    constructor(date, description, amount) {
        this.date = date;
        this.description = description;
        this.amount = amount;
    }
    display() {
        return `
                    <td>${this.date}</td>
                    <td>${this.description}</td>
                    <td>${this.amount}</td>
                `;
    }
}
let incomes = [];
let expense = [];
// function to show balance
function updateBalance(){
    let totalIncome = 0
    let totalExpenses = 0
    for(let i = 0; i<incomes.length;i++){
        totalIncome += Number(incomes[i].amount)
    }
    for(let i = 0; i<expense.length;i++){
        totalExpenses += Number(expense[i].amount)
    }
    balance.textContent = `${totalIncome - totalExpenses} RWF`;
    balance.style.color = totalIncome - totalExpenses < 0 ? 'red' : 'green'; // Change color based on balance
}

// Add event listener to the submit button
expensesSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (dateInput.value && descriptionInput.value && amountInput.value) {
            const newRow = new Expense(dateInput.value, descriptionInput.value, amountInput.value);
            //push the new row to the expenses array
            expense.push(newRow);
            // Create a new row element
            newRowElement = document.createElement('tr');
            newRowElement.innerHTML = newRow.display(); // Use the display method to get the
            expensesRows.appendChild(newRowElement);
            dateInput.value = '';
            descriptionInput.value = '';
            amountInput.value = '';
            updateBalance(); // Update the balance after adding a new expense

        } else {
            alert('Please fill in all fields');
        }
    });
incomeSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (incomeDateInput.value && incomeDescriptionInput.value && incomeAmountInput.value) {
        const newRow = new Income(incomeDateInput.value, incomeDescriptionInput.value, incomeAmountInput.value);
        newRowElement = document.createElement('tr');
        // push the new row to the incomes array
        incomes.push(newRow)
        // Create a new row element
        newRowElement.innerHTML = newRow.display(); // Use the display method to get the HTML
        // Append the new row to the income table
        incomeRows.appendChild(newRowElement);
        incomeDateInput.value = '';
        incomeDescriptionInput.value = '';
        incomeAmountInput.value = '';
        updateBalance(); // Update the balance after adding a new income
    } else {
        alert('Please fill in all fields');
    }
})

// function to add a new row to the income table
