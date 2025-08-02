window.onload = () => {
    const table = document.querySelector("#dataTable tbody");

    let raw = localStorage.getItem("idData");
    if (!raw) return;

    // 🔧 تنظيف ```json و``` إذا موجودة
    raw = raw.trim();
    if (raw.startsWith("```")) {
        raw = raw.replace(/```json|```/g, "").trim();
    }

    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        console.error("❌ فشل في تحويل النص إلى JSON:", e);
        return;
    }

    renderRow(data, table);
};

function renderRow(entry, table) {
    const row = document.createElement("tr");
    const keys = ["صورة الوثيقة", "الاسم الأول", "الاسم الثاني", "الاسم الثالث", "الاسم الأخير", "رقم الهوية", "العمر", "القيود", "حالة سريان الرخصة", "النوع"];
    keys.forEach(key => {
        const td = document.createElement("td");
        td.textContent = entry[key] || "";
        td.contentEditable = true;
        row.appendChild(td);
    });

    const editTd = document.createElement("td");
    const delTd = document.createElement("td");
    editTd.innerHTML = "<button onclick='saveRow(this)'>💾</button>";
    delTd.innerHTML = "<button onclick='deleteRow(this)'>🗑️</button>";
    row.appendChild(editTd);
    row.appendChild(delTd);
    table.appendChild(row);
}

function saveRow(btn) {
    const row = btn.parentElement.parentElement;
    const cells = row.querySelectorAll("td");
    const updated = {
        "صورة الوثيقة": cells[0].textContent,
        "الاسم الأول": cells[1].textContent,
        "الاسم الثاني": cells[2].textContent,
        "الاسم الثالث": cells[3].textContent,
        "الاسم الأخير": cells[4].textContent,
        "رقم الهوية": cells[5].textContent,
        "العمر": cells[6].textContent,
        "النوع": cells[7].textContent,
        "حالة سريان الرخصة": cells[8].textContent,
        "نوع القيد": cells[9].textContent
    };
    localStorage.setItem("idData", JSON.stringify(updated));
    alert("✅ تم الحفظ!");
}

function deleteRow(btn) {
    const row = btn.parentElement.parentElement;
    row.remove();
    localStorage.removeItem("idData");
}
