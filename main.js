// ==========================================
// كلاس Student مع حارس الأمان (Encapsulation)
// ==========================================
class Student {
    #name;
    #grades;
    #attendance;

    constructor(name, grades, attendance) {
        this.name = name;
        this.grades = grades;
        this.attendance = attendance;
    }

    set name(value) {
        if (!value || value.trim() === "") {
            throw new Error("برجاء إدخال اسم الطالب بشكل صحيح (لا يمكن أن يكون فارغاً).");
        }
        this.#name = value.trim();
    }
    get name() {
        return this.#name;
    }

    set grades(values) {
        if (!Array.isArray(values) || values.length !== 3) {
            throw new Error("يجب إدخال ثلاث درجات للمواد المختلفة.");
        }
        
        for (let i = 0; i < values.length; i++) {
            let grade = Number(values[i]);
            if (isNaN(values[i]) || values[i] === "" || grade < 0 || grade > 100) {
                throw new Error(`درجة المادة رقم ${i + 1} غير صالحة. يجب أن تكون رقماً بين 0 و 100.`);
            }
        }
        this.#grades = values.map(g => Number(g));
    }
    get grades() {
        return this.#grades;
    }

    set attendance(value) {
        let att = Number(value);
        if (isNaN(value) || value === "" || att < 0 || att > 100) {
            throw new Error("نسبة الحضور غير صالحة. يجب أن تكون بين 0 و 100.");
        }
        this.#attendance = att;
    }
    get attendance() {
        return this.#attendance;
    }

    calculateAverage() {
        const sum = this.#grades.reduce((total, current) => total + current, 0);
        return sum / this.#grades.length;
    }
}

// ==========================================
// التفاعل مع الشاشة ولجنة الرأفة
// ==========================================
const studentsList = [];

const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");

const addBtn = document.getElementById("addBtn");
const mercyBtn = document.getElementById("mercyBtn");

const errorBox = document.getElementById("errorBox");
const studentsListBox = document.getElementById("studentsListBox");
const reportBox = document.getElementById("reportBox");

// 1. زر إضافة طالب
addBtn.addEventListener("click", function () {
    errorBox.classList.add("d-none");
    errorBox.innerHTML = "";

    try {
        const nameVal = studentNameInput.value;
        const gradesVal = [
            grade1Input.value,
            grade2Input.value,
            grade3Input.value
        ];
        const attendanceVal = attendanceInput.value;

        const newStudent = new Student(nameVal, gradesVal, attendanceVal);
        studentsList.push(newStudent);

        updateStudentsListUI();

        studentNameInput.value = "";
        grade1Input.value = "";
        grade2Input.value = "";
        grade3Input.value = "";
        attendanceInput.value = "";

    } catch (error) {
        errorBox.classList.remove("d-none");
        errorBox.innerHTML = error.message;
    }
});

function updateStudentsListUI() {
    if (studentsList.length === 0) {
        studentsListBox.innerHTML = `<p class="text-muted text-center m-0">لم يتم إضافة طلاب بعد...</p>`;
        return;
    }

    let htmlContent = `<ul class="list-group">`;
    studentsList.forEach((student, index) => {
        let avg = student.calculateAverage().toFixed(2);
        htmlContent += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><strong>${index + 1}. ${student.name}</strong></span>
                <span class="badge bg-primary rounded-pill">المتوسط: ${avg} | الحضور: ${student.attendance}%</span>
            </li>
        `;
    });
    htmlContent += `</ul>`;
    studentsListBox.innerHTML = htmlContent;
}

// 2. زر تفعيل لجنة الرأفة (Filter, Map, Reduce)
mercyBtn.addEventListener("click", function () {
    if (studentsList.length === 0) {
        reportBox.innerHTML = `<p class="text-danger text-center m-0">عذراً، لا يوجد طلاب مسجلين لتفعيل لجنة الرأفة!</p>`;
        return;
    }

    const strugglingStudents = studentsList.filter(student => {
        let avg = student.calculateAverage();
        return avg >= 40 && avg <= 49;
    });

    if (strugglingStudents.length === 0) {
        reportBox.innerHTML = `<p class="text-warning text-center m-0">لا يوجد طلاب متعثرون مستحقون للرأفة (المتوسطات بين 40 و 49) حالياً.</p>`;
        return;
    }

    const updatedStruggling = strugglingStudents.map(student => {
        let oldAvg = student.calculateAverage();
        let newAvg = Math.min(100, oldAvg + 5);
        return {
            name: student.name,
            oldAverage: oldAvg,
            newAverage: newAvg
        };
    });

    const totalNewAverages = updatedStruggling.reduce((sum, current) => sum + current.newAverage, 0);
    const generalNewAverage = totalNewAverages / updatedStruggling.length;

    let reportHtml = `
        <div class="alert alert-success mb-2">
            <strong>تم تطبيق لجنة الرأفة بنجاح!</strong>
        </div>
        <p><strong>عدد الطلاب المتعثرين المستفيدين:</strong> ${updatedStruggling.length}</p>
        <p><strong>أسماء الطلاب ومتوسطاتهم بعد الرأفة (+5 درجات):</strong></p>
        <ul class="list-group mb-3">
    `;

    updatedStruggling.forEach(item => {
        reportHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${item.name} (القديم: ${item.oldAverage.toFixed(2)})</span>
                <span class="badge bg-success">بعد الرأفة: ${item.newAverage.toFixed(2)}</span>
            </li>
        `;
    });

    reportHtml += `
        </ul>
        <p class="bg-light p-2 rounded text-center fw-bold text-dark border">
            📊 المتوسط العام لدرجات الطلاب المتعثرين بعد الرأفة = ${generalNewAverage.toFixed(2)}
        </p>
    `;

    reportBox.innerHTML = reportHtml;
});