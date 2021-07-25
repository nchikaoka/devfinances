const Modal = {
    open () {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close () {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
};

const Utils = {
    formatToCurrency (value) {
        const signal = Number(value) >= 0 ? "" : "-";
        value = String(value).replace(/\D/g, '');

        value = Number(value) / 100;

        value = value.toLocaleString('pt-br', {
            style: "currency",
            currency: "BRL"
        });
        
        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100;
        return value;
    },

    formatDate(date) {
        date = date.split('-');
        return `${date[2]}/${date[1]}/${date[0]}`
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("Transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("Transactions", JSON.stringify(transactions))
    }
}

const Balance = {
    all: Storage.get(),

    addTransaction(transaction) {
        this.all.push(transaction);

        App.reload();
    },

    removeTransaction(index) {
        this.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;
        income = this.all.reduce((sum, transaction) => transaction.amount > 0 ? sum += transaction.amount : sum, 0)

        return income;
    },

    expenses() {
        let expense = 0;
        expense = this.all.reduce((sum, transaction) => transaction.amount < 0 ? sum += transaction.amount : sum, 0)

        return expense;
    },

    total() {
        return this.incomes() + this.expenses();
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction (transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? "income" : "expense"
        const amount = Utils.formatToCurrency(transaction.amount);
        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Balance.removeTransaction(${index})" src="./assets/minus.svg" alt="remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatToCurrency(Balance.incomes());
        document.getElementById("expenseDisplay").innerHTML = Utils.formatToCurrency(Balance.expenses());
        document.getElementById("totalDisplay").innerHTML = Utils.formatToCurrency(Balance.total());
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = "";
    }
};

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    formatValues() {
        let { description, amount, date } = this.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return { description, amount, date };
    },

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validate() {
        const { description, amount, date} = Form.getValues();
        
        if( description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    clearFields () {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault();


        try {
            Form.validate();
            const transaction = Form.formatValues();
            Balance.addTransaction(transaction);
            Form.clearFields();
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    }
}

const App = {
    init() {

        Balance.all.forEach((transaction, index) => DOM.addTransaction(transaction,index));

        DOM.updateBalance();

        Storage.set(Balance.all);
    },

    reload() {
        DOM.clearTransactions();
        this.init();

    }
};

App.init()




