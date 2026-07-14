const SUPABASE_URL = "https://nxbhyybjmmecysbnrstm.supabase.co";
    const SUPABASE_KEY = "sb_publishable_4-YpKSS6qG7AxnQUFg998A_p52L5K4h";
    
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const fileLabel = document.getElementById('file-label-text');
    const statusText = document.getElementById('status');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const submitBtn = document.getElementById('submit-btn');
    fileInput.addEventListener('change', function(e){
        fileLabel.innerText = e.target.files[0].name;
    });
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        const targetTable = document.getElementById('target-table').value;
        
        statusText.innerText = "1/2 جاري رفع الصورة...";
        progressBar.style.display = "block";
        progressFill.style.width = "50%";
        submitBtn.disabled = true;
        
        const fileName = Date.now() + "_" + file.name.replace(/\s+/g, '_');
        
        fetch(`${SUPABASE_URL}/storage/v1/object/${targetTable}/${fileName}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY, 'Content-Type': file.type },
            body: file
        }).then(res => {
            if (res.ok) {
                const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${targetTable}/${fileName}`;
                uploadData(publicUrl, targetTable);
            } else throw new Error("فشلت خطوة رفع الصورة");
        }).catch(err => { 
            statusText.innerText = err.message; 
            statusText.style.color = "red"; 
            submitBtn.disabled = false;
        });
    });

    function uploadData(imageUrl, table) {
        statusText.innerText = "2/2 جاري النشر وإتمام العملية...";
        progressFill.style.width = "100%";
        
        const rowData = {
            title: document.getElementById('title').value,
            desc: document.getElementById('desc').value,
            img: imageUrl
        };
        
        if (table === 'studio') {
            rowData.likes = 0; rowData.dislikes = 0; rowData.dnls = 0;
        }

        fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(rowData)
        }).then(async res => {
            if (res.ok) {
                statusText.innerText = "تم النشر بنجاح!";
                statusText.style.color = "green";
                form.reset();
                fileLabel.innerText = "📂 اختر صورة المحتوى";
            } else {
                const errorData = await res.json();
                console.error("Supabase Error:", errorData);
                statusText.innerText = "خطأ: " + (errorData.message || "فشل حفظ البيانات");
                statusText.style.color = "red";
            }
        }).catch(err => { 
            statusText.innerText = err.message; 
            statusText.style.color = "red"; 
        }).finally(() => {
            submitBtn.disabled = false;
            setTimeout(() => progressBar.style.display = "none", 2000);
        });
    }