
//BUDGET CONTROLLER 


var budgetController = (function() {
    
    
    // ....................Constructors....................... 
    
    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }; 
    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);    
        } else {
            this.percentage = -1;
        }   
    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value; 
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            
            var newItem, ID;
            // Create New ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
                
            
            // Create New Item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }
            // Push it to the DataStructure
            data.allItems[type].push(newItem);
            return newItem;
            
        },


        deleteItem: function (type,id) {
            var ids, index;
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            // calculate total income and expenses 
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budge: income - expenses 
            
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income 
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            } else {
                data.percentage = -1;
            }
            

            
        },
        calculatePercentage: function(){
            /* 
            a = 20
            b = 10
            c = 40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%

            */
           data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
           });
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();



// UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        descriptionType: '.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        keypressType: 'keypress',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp 
                description: document.querySelector(DOMstrings.descriptionType).value,
                value: parseFloat(document.querySelector(DOMstrings.valueType).value)
            };
        },

        addListItem: function(obj,type) {
            var html, newHtml;
            // Create HTML string with placeHolder Text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i> </button> </div> </div> </div>'
            }else{
                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i> </button></div></div></div>'
            }
           
            // html ='<div class="item clearfix" id="expense-0"><div class="item__description">Apartment rent </div> <div class="right clearfix"> <div class="item_value">-900.00</div><div class="item_percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i> </button></div></div></div>'
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id', obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMstrings.descriptionType + ', ' + DOMstrings.valueType);
        
            //fields is not an array. So, we need to create a coppy //

            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
           
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            } 

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            var nodeListForEach = function(list, callback) {
                for(var i=0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index ){
               if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }       
            }); 

        },


        displayMonth: function() {
            var now, year;
            now = new Date();
            // var Eid = new Date(2016,11,25);
            year = now.getFullYear();
            if(document.querySelector(DOMstrings.dateLabel) !== null) {
                document.querySelector(DOMstrings.dateLabel).textContent = year;
            }
            
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

// GLOBAL APP CONTROLLER 
var controller = (function(budgetCtrl,UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem); 
        
        document.addEventListener(DOM.keypressType, function(event){
            if(event.key === 'Enter'){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    };
    
    var updateBudget = function() {
        
        // Calculate The Budget
        budgetController.calculateBudget();
        // Return the Budget
        var budget = budgetController.getBudget();
        // Display the Budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // 1. Calculate percentages 
        budgetCtrl.calculatePercentage();

        var percentages = budgetCtrl.getPercentage();
        // 2. Read percentages from the budget controller
        
        //3. Update the UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the filed input data
        input = UICtrl.getInput();


        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. Add the item to the budget Controller
            newItem = budgetController.addItem(input.type,input.description,input.value);
            // 3.ADD the item to the UI 
            UICtrl.addListItem(newItem,input.type);
            //4. Clear the Field //
            UICtrl.clearFields();
    
            // 5. Calculate The budget 
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete The Item from the data Structure 
                budgetCtrl.deleteItem(type, ID);
            // 2. Delete the Item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and showthe new budget
            updateBudget();
            
        }

    }; 
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);


controller.init();
