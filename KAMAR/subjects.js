module.exports = subject => {
    if ((subject = subject.toUpperCase()).match(/AT../)) return 'Manaaki';
    return {
        //General
            "HOUSE": "House Assembly",
            "TUTOR": "Form Class",

        //Year 10
            "10HPE": "P.E.",
            "10HPEH": "Health",
            "10EFL": "EFL", //
            "10ENG": "English",

            "10DVC": "DVC",
            "10TMR": "Hard Tech",
            "10TMS": "Soft Tech",
            "10TMF": "Food Tech",

            "10ART": "Art",
            "10MUS": "Music",

            "10FRE": "French",
            "10JPN": "Janapense",
            "10SPA": "Spanish",
            "10MRI": "Maori",
            "10GER": "German",

        //Year 11
            "L1ASO": "Social Studies", //Year 10 LEAP only
            "L1ASC": "Science",       //Year 10 LEAP only
            "L1AMA": "Maths",        //Year 10 LEAP only
            "L1MAT": "Maths",
            "L1MAX": "Maths",
            "L1ENG": "English",
            "L1EAP": "English for Academic Purposes",

            "L1LS": "Learning Services",

            "L1ACC": "Accounting",
            "L1ADG": "Visual Arts - Digital",
            "L1ART": "Art",
            "L1BIO": "Biology",
            "L1BUS": "Business Studies",
            "L1CHE": "Chemistry",
            "L1CLS": "Classics",
            "L1CMP": "Computer Science",
            "L1DAN": "Dance",
            "L1DRA": "Drama",
            "L1DVC": "Design and Visual Communication",
            "L1EAC": "Economics and Accounting",
            "L1ECO": "Economics",
            "L1FRE": "French",
            "L1GEO": "Geography",
            "L1GER": "German",
            "L1HEA": "Health",
            "L1HIS": "History",
            "L1JPN": "Japanese",
            "L1MED": "Media Studies",
            "L1MRI": "Te Reo Maori",
            "L1MUS": "Music",
            "L1PED": "Physical Education",
            "L1PHY": "Physics",
            "L1SCA": "Science: Applied",
            "L1SCI": "Science",
            "L1SPA": "Spanish",
            "L1TFN": "Technology - Food & Nutrition",
            "L1TMR": "Technology - Resistant Materials",
            "L1TMS": "Technology - Soft Materials"
    }[subject] || subject;
};