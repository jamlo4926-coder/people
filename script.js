const textarea = document.getElementById("listt");
const submitButton = document.getElementById("lalaland");

const inputSection = document.getElementById("inputSection");
const dashboard = document.getElementById("dashboard");

const peopleContainer = document.getElementById("peopleContainer");

const searchInput = document.getElementById("search");

const copyFullButton = document.getElementById("copyFull");
const clearAllButton = document.getElementById("clearAll");

const totalCount = document.getElementById("totalCount");
const stats = document.getElementById("stats");

const toast = document.getElementById("toast");

/* =========================
DATA
========================= */

let people = [];

/*
ONLY DIAL and METH are remembered.

Example:

{
    "john smith": {
        name: "John Smith",
        type: "DIAL"
    },

    "jane doe": {
        name: "Jane Doe",
        type: "METH"
    }
}


*/

let history =
JSON.parse(
localStorage.getItem("peopleHistory")
) || {};

const rememberedCategories = [
"DIAL",
"METH"
];

const categories = {

METH: {
    color: "meth",
    label: "METH"
},

DIAL: {
    color: "dial",
    label: "DIAL"
},

VM: {
    color: "vm",
    label: "VM"
},

BN: {
    color: "bn",
    label: "BN"
},

NA: {
    color: "na",
    label: "NA"
},

CON: {
    color: "con",
    label: "CON"
},

CANC: {
    color: "canc",
    label: "CANC"
}


};

/* =========================
HISTORY FUNCTIONS
========================= */

/*
Makes names easier to match.

" John   Smith "
"JOHN SMITH"
"john smith"

all become:

"john smith"


*/

function normalizeName(name) {

return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();


}

/*
Save history to browser storage.
*/

function saveHistory() {

localStorage.setItem(
    "peopleHistory",
    JSON.stringify(history)
);


}

/*
Check whether this person
has been seen before.
*/

function getPreviousType(name) {

const key =
    normalizeName(name);


if (history[key]) {

    return history[key].type;

}


return null;


}

/*
Remember a person ONLY if
they are DIAL or METH.
*/

function rememberPerson(person) {

if (
    !rememberedCategories.includes(
        person.type
    )
) {

    return;

}


const key =
    normalizeName(person.name);


history[key] = {

    name: person.name,

    type: person.type

};


saveHistory();


}

/*
Remove someone from history.
*/

function forgetPerson(name) {

const key =
    normalizeName(name);


delete history[key];


saveHistory();


}

/* =========================
TOAST
========================= */

function showToast(message) {

toast.textContent = message;

toast.classList.add("show");


setTimeout(() => {

    toast.classList.remove("show");

}, 1800);


}

/* =========================
COPY
========================= */

async function copyText(text) {

try {

    await navigator.clipboard.writeText(text);

    showToast(
        "Copied to clipboard!"
    );

} catch (error) {

    console.error(error);

    showToast(
        "Could not copy text."
    );

}


}

/* =========================
LOAD LIST
========================= */

submitButton.addEventListener(
"click",
() => {

    const text =
        textarea.value.trim();


    if (!text) {

        showToast(
            "Please enter some names."
        );

        return;

    }


    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);


    /*
        Create people.

        BEFORE setting type to null,
        check the history.

        This is what automatically
        flags previous DIAL/METH people.
    */

    let autoFlagged = 0;


    people =
        lines.map(name => {

            const previousType =
                getPreviousType(name);


            if (previousType) {

                autoFlagged++;

            }


            return {

                name,

                type: previousType,

                auto: Boolean(previousType)

            };

        });


    inputSection.classList.add(
        "hidden"
    );


    dashboard.classList.remove(
        "hidden"
    );


    render();


    /*
        Tell user how many people
        were automatically flagged.
    */

    if (autoFlagged > 0) {

        showToast(
            `${autoFlagged} previous DIAL/METH member(s) automatically flagged.`
        );

    }

}


);

/* =========================
RENDER
========================= */

function render() {

const searchTerm =
    searchInput.value
        .trim()
        .toLowerCase();


peopleContainer.innerHTML = "";


people
    .filter(person =>
        person.name
            .toLowerCase()
            .includes(searchTerm)
    )
    .forEach(person => {

        createPersonRow(person);

    });


updateStats();


}

/* =========================
CREATE PERSON
========================= */

function createPersonRow(person) {

const row =
    document.createElement("div");


row.className =
    "person";


/*
    Add category row color.
*/

if (person.type) {

    row.classList.add(
        `${person.type.toLowerCase()}-row`
    );

}


/* =========================
   NAME
========================= */

const name =
    document.createElement("span");


name.className =
    "person-name";


name.textContent =
    person.name;


row.appendChild(name);


/*
    If this person was automatically
    flagged from history, show AUTO.
*/

if (person.auto) {

    const autoBadge =
        document.createElement("span");


    autoBadge.className =
        "auto-badge";


    autoBadge.textContent =
        "AUTO";


    autoBadge.title =
        "Automatically assigned from history";


    row.appendChild(autoBadge);

}


/* =========================
   CATEGORY BUTTONS
========================= */

Object.keys(categories)
    .forEach(type => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            `category-button ${categories[type].color}`;


        button.textContent =
            categories[type].label;


        /*
            Highlight current category.
        */

        if (
            person.type === type
        ) {

            button.classList.add(
                "active"
            );

        }


        /*
            CATEGORY CLICK
        */

        button.addEventListener(
            "click",
            () => {

                person.type = type;


                /*
                    This is no longer
                    considered automatic
                    because YOU manually
                    selected it.
                */

                person.auto = false;


                /*
                    If DIAL or METH,
                    save to history.
                */

                rememberPerson(
                    person
                );


                render();

            }
        );


        row.appendChild(button);

    });


/* =========================
   COPY
========================= */

const copyButton =
    document.createElement(
        "button"
    );


copyButton.className =
    "copy-button";


copyButton.textContent =
    "COPY";


copyButton.addEventListener(
    "click",
    () => {

        copyText(
            person.name
        );

    }
);


row.appendChild(copyButton);


/* =========================
   CLEAR
========================= */

const clearButton =
    document.createElement(
        "button"
    );


clearButton.className =
    "clear-button";


clearButton.textContent =
    "CLEAR";


clearButton.addEventListener(
    "click",
    () => {

        /*
            IMPORTANT:

            This removes the classification
            from THIS list.

            It does NOT remove the person
            from DIAL/METH history.
        */

        person.type = null;

        person.auto = false;


        render();

    }
);


row.appendChild(clearButton);


peopleContainer.appendChild(row);


}

/* =========================
STATISTICS
========================= */

function updateStats() {

totalCount.textContent =
    people.length;


stats.innerHTML = "";


Object.keys(categories)
    .forEach(type => {

        const count =
            people.filter(
                person =>
                    person.type === type
            ).length;


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "stat";


        const label =
            document.createElement(
                "span"
            );


        label.className =
            "stat-label";


        label.textContent =
            type;


        const number =
            document.createElement(
                "strong"
            );


        number.className =
            "stat-number";


        number.textContent =
            count;


        card.appendChild(label);

        card.appendChild(number);

        stats.appendChild(card);

    });


/* =========================
   UNASSIGNED
========================= */

const unassigned =
    people.filter(
        person =>
            !person.type
    ).length;


const unassignedCard =
    document.createElement(
        "div"
    );


unassignedCard.className =
    "stat";


unassignedCard.innerHTML = `
    <span class="stat-label">
        UNASSIGNED
    </span>

    <strong class="stat-number">
        ${unassigned}
    </strong>
`;


stats.appendChild(
    unassignedCard
);


}

/* =========================
SEARCH
========================= */

searchInput.addEventListener(
"input",
render
);

/* =========================
COPY FULL LIST
========================= */

copyFullButton.addEventListener(
"click",
() => {

    if (!people.length) {

        showToast(
            "No names available."
        );

        return;

    }


    const fullList =
        people
            .map(person => {

                return `${person.name} ${person.type ?? ""}`
                    .trim();

            })
            .join("\n");


    copyText(
        fullList
    );

}


);

/* =========================
CLEAR CURRENT LIST
========================= */

clearAllButton.addEventListener(
"click",
() => {

    const confirmed =
        confirm(
            "Clear the entire current list?"
        );


    if (!confirmed) {

        return;

    }


    /*
        IMPORTANT:

        This clears the CURRENT LIST.

        Your DIAL/METH history stays
        completely intact.
    */

    people = [];


    textarea.value = "";


    dashboard.classList.add(
        "hidden"
    );


    inputSection.classList.remove(
        "hidden"
    );


    updateStats();

}


);