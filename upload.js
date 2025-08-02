// تشغيل الكاميرا الأمامية
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }, // "user" للكاميرا الأمامية
    audio: false
}).then(stream => {
    video.srcObject = stream;
}).catch(err => {
    document.getElementById('status').textContent = "فشل في فتح الكاميرا: " + err;
});


// التقاط صورة من الفيديو وتحليلها
function captureAndProcess() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/jpeg');

    fetch(imageDataURL)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
            processCapturedFile(file); // تمرير الصورة للمعالجة
        });
}

// المعالجة الذكية باستخدام GPT
async function processCapturedFile(file) {
    const status = document.getElementById('status');

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        status.textContent = "⏳ جاري تحليل الصورة...";

        const prompt = `
            أنت نظام ذكي لتحليل صور الهوية. استخرج البيانات التالية من النص بدقة وأعدها بصيغة JSON فقط:

            {
            "صورة الوثيقة: "id_009.jpg",
            "الاسم الأول": "...",
            "الاسم الثاني": "...",
            "الاسم الثالث": "...",
            "الاسم الأخير": "...",
            "رقم الهوية": "...",
            "العمر": "...",
            "القيود": "...",
            "حالة سريان الرخصة": "...",
            "النوع: "..."
            }

            حالة سريان الرخصة اذا كان تاريخ الانتهاء أقل من تاريخ اليوم ضع منتهي، وإذا كان أكبر ضع ساري.
            القيود أكتب لا يوجد قيود
            النوع يقصد بها نوع المركبة غالبًا الإجابة نقل ثقيل أو شاحنة
            إذا لم تفهم الصورة، فقط أعد: "❌ فشل في التحليل"
        `;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "أنت مساعد ذكي متخصص في قراءة النص الموجود فالصور."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                        ]
                    }
                ],
                temperature: 0.2
            })
        });

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        if (content) {
            localStorage.setItem("idData", content);
            window.location.href = "manage.html";
        } else {
            status.textContent = "❌ فشل استخراج البيانات. حاول مجددًا.";
        }
    };
    reader.readAsDataURL(file);
}


