var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
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
        addItem: function (type, desc, val) {
            var newItem, ID;

            //ID Number generation...
            if (data.allItems[type].length == 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            //Create Item Based on Expense or Income
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else {
                newItem = new Income(ID, desc, val);
            }

            //Push it into data structure
            data.allItems[type].push(newItem);

            //Return new Element
            return newItem;
        },


        calculateBudget: function () {
            // Calculate Budget
            /*
                 calculate income
                 calculate expenses
                 budget = income - expenses
            */
            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;

            data.percentage = Math.round(data.totals.exp * 100.0 / data.totals.inc);

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                income: data.totals.inc,
                expense: data.totals.exp,
                percentage: data.percentage
            };
        },

        deleteItem: function (type, id) {
            // Converting type as it will be passed as "income" or "expense"//
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data);
        }
    };


})();

var UIController = (function () {


    var DOMStrings = {
        inputType: '.add__type',
        descriptionType: '.add__description',
        valueType: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        containerLabel: '.container',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (number, type) {

        /*
        + or - befor the number
        exactly 2 decimal points
        comma seperating
        */

        number = Math.abs(number);
        number = number.toFixed(2);

        return (type === 'exp' ? '-' : '+') + '' + number;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.descriptionType).value,
                value: parseFloat(document.querySelector(DOMStrings.valueType).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;

            if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }



            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.descriptionType + ', ' + DOMStrings.valueType);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        displayBudget: function (obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.income;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.expense;
            if (obj.percentage !== -1) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }
        },

        displayPercentages: function (per) {

            var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function (current, index) {

                if (per[index] > 0) {
                    current.textContent = per[index] + '%';
                } else {
                    current.textContent = per[index] + '%';
                }

            });
        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();


            year = now.getFullYear();
            month = now.getMonth();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();

var controller = (function (BudgetCtrl, UICtrl) {

    var DOM = UICtrl.getDOMStrings();

    var updateBudget = function () {

        // Calculate Budget
        BudgetCtrl.calculateBudget();

        // Returns the Budget
        var budget = BudgetCtrl.getBudget();

        // Display the Budget
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get Field Data 
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add Item To Budget Controller
            newItem = BudgetCtrl.addItem(input.type, input.description, input.value);


            // 3. Add Item To the UI
            UICtrl.addListItem(newItem, input.type);

            //3.5 Update the clearFeilds
            UICtrl.clearFields();

            // 4. Update Budget
            updateBudget();

            // 5. Updates Percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {

        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');

            type = splitID[0];
            ID = parseInt(splitID[1]);

            BudgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }

    };

    var setupEventListeners = function () {
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode == 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.containerLabel).addEventListener('click', ctrlDeleteItem);
    };

    var updatePercentages = function () {
        // 1. Update Percentages
        BudgetCtrl.calculatePercentages();

        // 2. Read Percentages from Budget Controller
        var percentages = BudgetCtrl.getPercentages();

        // 3. Print Percentages
        UICtrl.displayPercentages(percentages);

    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
}(budgetController, UIController));

controller.init();
