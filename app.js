//BUDGET CONTROLLER
var budgetController = (function(){
	//function constructor for the expenses
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	//function prototype so every expense created inherits it
	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}else{
			this.percentage = -1;
		}
	};

	//get method for the percentage
	Expense.prototype.getPercentage= function(){
		return this.percentage;
	};

	//function constructor for the incomes
	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	//private function to calcilate total of income and expense and then call it in uodateBudget
	var calculateTotal = function(type){
		var sum = 0;
		//loop through allItems array and calculate sum
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		//store the sum inside the totals array
		data.totals[type] = sum;
	}

	//data structure to store all out data
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

	//create a public addItem function to make other modules able to add items
	//the type recieved is coming from getInput function and its either inc or exp
	return {
		addItem: function(type, des, val){
			var newItem, ID;
			//create new ID; .id retrieves the id of the element
			//make sure there is smt in the array so we can test
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			}else{
				ID = 0;
			}
			//create new item based on the type 'inc' or 'exp'
			if(type === 'exp'){
				newItem = new Expense(ID, des, val);
			}else if(type === 'inc'){
				newItem = new Income(ID, des, val);
			}

			//push the created item into our data structure
			data.allItems[type].push(newItem);
			//return the new element
			return newItem;
		},

		//function to delete an item; gonna be called by the budget controller
		deleteItem: function(type, id){
			var ids, index;

			//id = 6
			//data.allItems[type][id] does not work
			//ids = [1 2 4 6 8]  example array
			//index = 3 which is id =6

			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},

		//calculateBudget function
		calculateBudget: function(){
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			//calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			//calculate the percentage of income spent
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);	
			}else{
				data.percentage = -1;
			}
		},

		//public function to calculate percentages
		//example: let our expenses be: a=10,b=20,c=40 and total income is 100 
		//then per of a = 10/100 and b = 20/100 and so on
		//so we create a function to calculate them all
		calculatePercentages: function(){
			//loop through the exp array and calculate the perc
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},

		//get method to return the percentages calculated
		//using map function since it returns something and 
		//stores it in a variable
		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},


		//return the budget function
		getBudget: function(){
			//we need to return 4 values so use an object
			return{
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		//make our data variable public so we can test
		testing: function(){
			console.log(data);
		}
	}
})();


//UI CONTROLLER
var UIController = (function(){
	//DOMstrings variable that contain all doms
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	//private function to format the numbers
	var formatNumber = function(num, type){
		var numSplit, int, dec, type;
		/*
			+ or - before number
			exactly 2 decimal points
			comma separating the thousands

			2130.4567 becomes + 2,310.46
			2000 becomes + 2,000.00
		*/

		num = Math.abs(num);
		num = num.toFixed(2);  //handling the decimal part

		numSplit = num.split('.');

		int = numSplit[0];
		if(int.length > 3){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);   //if input is 23150 then output will be 23,150
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	//what is returned is a nodeList not an array
	var nodeListForEach = function(list, callback){
		for(var i=0; i < list.length; i++){
			callback(list[i], i);
		}
	};


	//all public functions
	return{
		getInput: function(){
			return{
				type: document.querySelector(DOMstrings.inputType).value, //will print out inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //returs value as a string
			};
		},

		//public method to access the data of newItem
		addListItem: function(obj, type){
			var html, newHtml, element;
			//create html string with place holder for income
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">description</div><div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			}else if(type==='exp'){
				element = DOMstrings.expensesContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">description</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			//replace those placeholder with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			//insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		//function to delete an item
		deleteItemList: function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el); //we cant remove a parent element only a child
		},

		//public function to clear input fields after being filled
		clearFields: function(){
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +
				DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);
			//forEach takes max of 3 arguments
			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});
			//focus back on first field
			fieldsArr[0].focus();
		},

		//displayBudget function that need an obj containing all 4 data we want to display
		//what we want to dispay is coming from the getBudget function
		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget , type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.budget , 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.budget , 'exp');
			

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		//displayPercentages function
		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			
			nodeListForEach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
			});
		},

		//function to display correct month
		displayDate: function(){
			var now, months, month, year;

			now = new Date();

			months = ['January', 'February', 'March', 'April',
			'May', 'June', 'July', 'August', 'September',
			'October', 'November', 'December'];
			month = now.getMonth();

			year = now.getFullYear();

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
		},

		//function of changing type of input (style manipulation)
		changedType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);

			nodeListForEach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		//expose the DOMstrings object to the public so that appController has access to it
		getDOMstrings: function(){
			return DOMstrings;
		}
	};
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
	//include all eventListeners in one private function
	var setupEventListeners = function(){
		//call the DOMstrings here
		var DOM = UICtrl.getDOMstrings();

		//eventListener when button is clicked
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		//eventListener when user presses enter on the whole document not a specific element
		//some browser's key code is which or keyCode
		document.addEventListener('keypress', function(event){
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});
		//target the container element(parent of inc and exp)
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	//updateBudget function
	var updateBudget = function(){
		//5. calculate the budget
		budgetCtrl.calculateBudget();
		//6.return the budget
		var budget = budgetCtrl.getBudget();
		//7. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	//function for updating percentages
	var updatePercentage = function(){
		//1. calculate percentages
		budgetCtrl.calculatePercentages();
		//2. read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		//3. update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};
	
	//custome function when item is added
	var ctrlAddItem = function(){
		var input, newItem;
		//1. Get the field input data
		input = UICtrl.getInput();
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			//3. add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			//4. clear the input fields
			UICtrl.clearFields();
			//5. calculate and update the budget
			updateBudget();
			//6. calculate and update percentages
			updatePercentage();
		}
	};

	//function to handle the parent element of income & expense
	var ctrlDeleteItem = function(event){
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
  		
  		if(itemID){
  			//inc-1 is an example of id used
  			//the split function splits the string to different
  			//parts so we can delete the id from the data
  			//structure and from the UI
  			splitID = itemID.split('-');
  			type = splitID[0];
  			ID = parseInt(splitID[1]);  //since id is returned as string; convert to number

  			//1. delete the item from the data structure
  			budgetCtrl.deleteItem(type, ID);
  			//2. delete the item from the UI
  			UICtrl.deleteItemList(itemID);
  			//3. update and show the new budget
  			updateBudget();
  			//4. calculate and update percentages
  			updatePercentage();
  		}
  	};

	//create an init functio to call the setupEventListeners
	//function and make it public
	return{
		init: function(){
			console.log('application started');
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
			setupEventListeners();
		}
	}

})(budgetController, UIController);


//call init function
controller.init();