

const dofw = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const table = document.getElementById('calendar-outline');

// calendar headers

// number of weeks in a month (max)
for (let i = 0; i < 6; i++) { 
    const week = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
        const element = document.createElement('td');
        week.append(element);
    }
    table.append(week);
}