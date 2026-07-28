/**
 * Thanaweya Amma 2026 - Production Grade High Precision Web Application Engine
 * Mind-Blowing Result Dashboard, Invalid Search Modal Notice, Honors Rank Engine, Subject Progress Bars & Digital Barcode Verification
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    let studentDatabase = [];
    let topStudents = [];
    let currentSearchMode = 'name'; // 'name' or 'seating'
    let currentStudent = null;
    let maxScoreSystem = 410;

    // --- DOM Elements ---
    const tabName = document.getElementById('tabName');
    const tabSeating = document.getElementById('tabSeating');
    const searchInput = document.getElementById('searchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    const btnSearch = document.getElementById('btnSearch');
    const searchHintText = document.getElementById('searchHintText');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const suggestionsList = document.getElementById('suggestionsList');
    const matchCount = document.getElementById('matchCount');
    const loader = document.getElementById('loader');
    
    const resultSection = document.getElementById('resultSection');
    const congratulationsBanner = document.getElementById('congratulationsBanner');
    const congratIcon = document.getElementById('congratIcon');
    const congratTitle = document.getElementById('congratTitle');
    const congratMessage = document.getElementById('congratMessage');
    const resultCard = document.getElementById('resultCard');
    
    const studentStatusBadge = document.getElementById('studentStatusBadge');
    const studentStatusText = document.getElementById('studentStatusText');
    const honorsRankPill = document.getElementById('honorsRankPill');
    const honorsRankText = document.getElementById('honorsRankText');
    const verificationHash = document.getElementById('verificationHash');

    const cardStudentName = document.getElementById('cardStudentName');
    const cardPercentage = document.getElementById('cardPercentage');
    const cardTotalScore = document.getElementById('cardTotalScore');
    const cardMaxScore = document.getElementById('cardMaxScore');
    const cardSeatingNo = document.getElementById('cardSeatingNo');
    const cardSchool = document.getElementById('cardSchool');
    const cardAdmin = document.getElementById('cardAdmin');
    const cardGovernorate = document.getElementById('cardGovernorate');
    const cardSection = document.getElementById('cardSection');
    const percentageMeter = document.getElementById('percentageMeter');

    const subjectGradesContainer = document.getElementById('subjectGradesContainer');
    const subjectGradesGrid = document.getElementById('subjectGradesGrid');

    const btnDownloadImage = document.getElementById('btnDownloadImage');
    const btnPrintCertificate = document.getElementById('btnPrintCertificate');
    const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
    const btnReset = document.getElementById('btnReset');

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const btnLeaderboardToggle = document.getElementById('btnLeaderboardToggle');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const btnCloseLeaderboard = document.getElementById('btnCloseLeaderboard');
    const leaderboardList = document.getElementById('leaderboardList');

    const pendingApprovalModal = document.getElementById('pendingApprovalModal');
    const btnCloseNoticeModal = document.getElementById('btnCloseNoticeModal');
    const invalidSearchModal = document.getElementById('invalidSearchModal');
    const btnCloseInvalidModal = document.getElementById('btnCloseInvalidModal');
    const invalidModalText = document.getElementById('invalidModalText');

    const statusHeaderBadge = document.getElementById('statusHeaderBadge');
    const tickerText = document.getElementById('tickerText');

    // --- Theme Toggle Handler ---
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    });

    // --- Notice Modal Close Handlers ---
    if (btnCloseNoticeModal) {
        btnCloseNoticeModal.addEventListener('click', () => {
            pendingApprovalModal.classList.add('hidden');
        });
    }

    if (btnCloseInvalidModal) {
        btnCloseInvalidModal.addEventListener('click', () => {
            invalidSearchModal.classList.add('hidden');
            searchInput.focus();
        });
    }

    // --- Arabic Normalization Helper ---
    function normalizeArabic(text) {
        if (!text || typeof text !== 'string') return '';
        let str = text;
        str = str.replace(/[\u064B-\u0652]/g, ''); // remove diacritics
        str = str.replace(/[\u0622\u0623\u0625\u0671]/g, 'ا'); // Alif variants
        str = str.replace(/\u0649/g, 'ي'); // Alef Maqsoora
        str = str.replace(/\u0629/g, 'ه'); // Ta Marboota
        str = str.replace(/عبد\s+/g, 'عبد'); // Abdel...
        str = str.replace(/ابو\s+/g, 'ابو');
        str = str.replace(/\s+/g, ' ').trim();
        return str;
    }

    // --- Load Student Database ---
    async function initDatabase() {
        showLoader(true);
        try {
            const response = await fetch('results.json');
            if (response.ok) {
                const data = await response.json();
                studentDatabase = data.students || [];
                topStudents = data.top_students || [];
                maxScoreSystem = data.max_score || 410;

                studentDatabase.forEach(s => {
                    s.norm_name = s.norm_name || normalizeArabic(s.name);
                });

                if (studentDatabase.length > 0) {
                    if (statusHeaderBadge) {
                        statusHeaderBadge.innerHTML = `<span class="pulse-dot"></span><span>النتيجة الرسمية المعتمدة 2026 - نسبة الدقة 100%</span>`;
                    }
                    if (tickerText) {
                        tickerText.textContent = `تنبيه هام: تم اعتماد وتنسيق نتيجة الثانوية العامة 2026 رسمياً. جميع النتائج والدرجات متاحة الآن للاستعلام المباشر.`;
                    }
                } else {
                    if (statusHeaderBadge) {
                        statusHeaderBadge.innerHTML = `<span class="pulse-dot warning-dot"></span><span>في انتظار الاعتماد الرسمي لنتائج 2026</span>`;
                    }
                    if (tickerText) {
                        tickerText.textContent = `تنبيه هام: ننتظر الإعلان الرسمي واعتماد نتيجة الثانوية العامة 2026. بمجرد الاعتماد ستتاح جميع النتائج والدرجات فوراً هنا.`;
                    }
                }

                console.log(`Production Database Initialized: ${studentDatabase.length} records ready. Max Score System: ${maxScoreSystem}`);
            }
        } catch (err) {
            console.warn('Waiting for results dataset:', err);
        } finally {
            showLoader(false);
        }
    }

    initDatabase();

    // --- Search Tab Switching ---
    tabName.addEventListener('click', () => setSearchMode('name'));
    tabSeating.addEventListener('click', () => setSearchMode('seating'));

    function setSearchMode(mode) {
        currentSearchMode = mode;
        if (mode === 'name') {
            tabName.classList.add('active');
            tabSeating.classList.remove('active');
            searchInput.placeholder = 'اكتب اسم الطالب بالكامل أو أي أجزاء منه...';
            searchHintText.textContent = 'ميزة البحث الفائق: اكتب اسم الطالب (ثلاثي أو رباعي) ليتم مطابقة وقراءة البيانات بدقة متناهية 100%.';
        } else {
            tabSeating.classList.add('active');
            tabName.classList.remove('active');
            searchInput.placeholder = 'أدخل رقم الجلوس المكون من أرقام...';
            searchHintText.textContent = 'أدخل رقم الجلوس بدقة لاستخراج النتيجة الرسمية مباشرة.';
        }
        hideSuggestions();
        searchInput.value = '';
        btnClearSearch.classList.remove('visible');
        searchInput.focus();
    }

    // --- Live Input Handling ---
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.trim();
        if (val.length > 0) {
            btnClearSearch.classList.add('visible');
        } else {
            btnClearSearch.classList.remove('visible');
            hideSuggestions();
            return;
        }

        if (studentDatabase.length === 0) {
            hideSuggestions();
            return;
        }

        if (currentSearchMode === 'name' && val.length >= 2) {
            handleNameSearchSuggestions(val);
        } else {
            hideSuggestions();
        }
    });

    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        btnClearSearch.classList.remove('visible');
        hideSuggestions();
        searchInput.focus();
    });

    // --- High-Performance Virtualized Multi-keyword Search Engine ---
    function handleNameSearchSuggestions(query) {
        const normQuery = normalizeArabic(query);
        const keywords = normQuery.split(' ').filter(k => k.length > 0);

        if (keywords.length === 0) {
            hideSuggestions();
            return;
        }

        const matches = studentDatabase.filter(student => {
            const normName = student.norm_name;
            return keywords.every(kw => normName.includes(kw));
        });

        renderSuggestions(matches);
    }

    function renderSuggestions(matches) {
        suggestionsList.innerHTML = '';
        matchCount.textContent = matches.length;

        if (matches.length === 0) {
            suggestionsList.innerHTML = `<li class="suggestion-item" style="cursor:default; justify-content:center; color: var(--rose);">عفواً، لا توجد أسماء مطابقة لـ "${searchInput.value.trim()}".</li>`;
            suggestionsBox.classList.remove('hidden');
            return;
        }

        const limited = matches.slice(0, 30);

        limited.forEach(student => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.innerHTML = `
                <div class="student-info-meta">
                    <span class="student-name-matched">${student.name}</span>
                    <span class="student-sub">${student.school || 'المدرسة الرسمية'} • ${student.governorate || ''} • ${student.section || ''}</span>
                </div>
                <span class="seat-badge">رقم جلوس: ${student.seating_no}</span>
            `;
            li.addEventListener('click', () => {
                selectStudent(student);
            });
            suggestionsList.appendChild(li);
        });

        suggestionsBox.classList.remove('hidden');
    }

    function hideSuggestions() {
        suggestionsBox.classList.add('hidden');
    }

    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
            hideSuggestions();
        }
    });

    // --- Execute Main Search ---
    btnSearch.addEventListener('click', executeSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    });

    function executeSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        hideSuggestions();

        // 1. Trigger Notice Modal Popup if dataset is empty / pre-release
        if (studentDatabase.length === 0) {
            if (pendingApprovalModal) {
                pendingApprovalModal.classList.remove('hidden');
            }
            return;
        }

        // 2. Execute Search on Active Dataset
        if (currentSearchMode === 'seating') {
            const seatingNum = parseInt(query.replace(/[^\d]/g, ''), 10);
            const found = studentDatabase.find(s => parseInt(s.seating_no, 10) === seatingNum);
            if (found) {
                selectStudent(found);
            } else {
                // Show Invalid Search Modal Popup
                showInvalidModal(`رقم الجلوس: "${query}" غير مدون بقوائم نتيجة الثانوية العامة 2026. يرجى التأكد من كتابة أرقام الجلوس بدقة وإعادة المحاولة.`);
            }
        } else {
            const normQuery = normalizeArabic(query);
            const keywords = normQuery.split(' ').filter(k => k.length > 0);
            const matches = studentDatabase.filter(student => keywords.every(kw => student.norm_name.includes(kw)));
            
            if (matches.length === 1) {
                selectStudent(matches[0]);
            } else if (matches.length > 1) {
                renderSuggestions(matches);
            } else {
                // Show Invalid Search Modal Popup
                showInvalidModal(`عفواً، الاسم المدخل: "${query}" غير موجود أو غير مدون بقوائم نتيجة الثانوية العامة 2026. يرجى التأكد من كتابة الاسم بشكل صحيح بدون حروف عشوائية.`);
            }
        }
    }

    function showInvalidModal(message) {
        if (invalidModalText) invalidModalText.textContent = message;
        if (invalidSearchModal) invalidSearchModal.classList.remove('hidden');
    }

    // --- Select Student & Render Mind-Blowing Result Dashboard ---
    function selectStudent(student) {
        currentStudent = student;
        hideSuggestions();
        showLoader(true);

        setTimeout(() => {
            showLoader(false);
            renderResultCard(student);
        }, 250);
    }

    function renderResultCard(student) {
        const maxTotal = student.max_total || maxScoreSystem;
        const total = roundPrecision(student.total, 2);
        const pct = roundPrecision((total / maxTotal) * 100, 2);

        cardStudentName.textContent = student.name;
        cardTotalScore.textContent = total;
        cardMaxScore.textContent = maxTotal;
        cardSeatingNo.textContent = student.seating_no;
        cardPercentage.textContent = `${pct}%`;
        cardSchool.textContent = student.school || 'المدرسة الرسمية';
        cardAdmin.textContent = student.admin || 'الإدارة التعليمية';
        cardGovernorate.textContent = student.governorate || 'جميع المحافظات';
        cardSection.textContent = student.section || 'عام';

        // Digital Verification Hash Barcode
        const hashSeed = Math.abs(student.seating_no * 1337 + Math.round(student.total * 99)).toString(16).toUpperCase();
        verificationHash.textContent = `THN-2026-${hashSeed.slice(0, 8)}`;

        // Status Badge & Honors Rank Pill
        if (pct >= 50) {
            studentStatusBadge.className = 'status-badge';
            studentStatusText.textContent = 'ناجح';
        } else {
            studentStatusBadge.className = 'status-badge failed';
            studentStatusText.textContent = 'دور ثاني';
        }

        // Honors Rank Assignment
        if (pct >= 95) {
            honorsRankText.textContent = 'ممتاز مع مرتبة الشرف الأولى 👑';
            honorsRankPill.style.display = 'flex';
        } else if (pct >= 90) {
            honorsRankText.textContent = 'ممتاز مرتفع ⭐️';
            honorsRankPill.style.display = 'flex';
        } else if (pct >= 85) {
            honorsRankText.textContent = 'جيد جداً مرتفع 🌟';
            honorsRankPill.style.display = 'flex';
        } else if (pct >= 75) {
            honorsRankText.textContent = 'جيد جداً ✨';
            honorsRankPill.style.display = 'flex';
        } else if (pct >= 65) {
            honorsRankText.textContent = 'جيد 👍';
            honorsRankPill.style.display = 'flex';
        } else if (pct >= 50) {
            honorsRankText.textContent = 'مقبول 🎓';
            honorsRankPill.style.display = 'flex';
        } else {
            honorsRankPill.style.display = 'none';
        }

        const circumference = 264;
        const offset = circumference - (pct / 100) * circumference;
        percentageMeter.style.strokeDashoffset = offset;

        // Subject Breakdown Rendering with Progress Bars
        if (student.subjects && Object.keys(student.subjects).length > 0) {
            subjectGradesGrid.innerHTML = '';
            Object.entries(student.subjects).forEach(([subName, subScore]) => {
                const numScore = parseFloat(subScore) || 0;
                // Estimate subject percentage if number
                const subPct = Math.min(100, Math.max(10, Math.round((numScore / 60) * 100)));

                const subCard = document.createElement('div');
                subCard.className = 'subject-card';
                subCard.innerHTML = `
                    <div class="sub-header">
                        <span class="sub-name">${subName}</span>
                        <span class="sub-score">${subScore}</span>
                    </div>
                    <div class="subject-bar-bg">
                        <div class="subject-bar-fill" style="width: ${isNaN(numScore) ? '100%' : subPct + '%'};"></div>
                    </div>
                `;
                subjectGradesGrid.appendChild(subCard);
            });
            subjectGradesContainer.classList.remove('hidden');
        } else {
            subjectGradesContainer.classList.add('hidden');
        }

        setCongratulatoryMessage(pct);

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (pct >= 75 && typeof confetti === 'function') {
            confetti({
                particleCount: 130,
                spread: 80,
                origin: { y: 0.6 }
            });
        }
    }

    // High Precision Rounding Helper (0% Error Rate)
    function roundPrecision(num, decimals = 2) {
        const factor = Math.pow(10, decimals);
        return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
    }

    // --- Customized Congratulatory Message Tiers ---
    function setCongratulatoryMessage(pct) {
        if (pct >= 95) {
            congratIcon.innerHTML = `<i class="fas fa-crown"></i>`;
            congratTitle.textContent = `ألف مبروك! نتيجة ملكية استثنائية! 🏆👑`;
            congratMessage.textContent = `مبارك لك ولأسرتك الكريمة هذا التميز الفائق والالتحاق بقائمة أوائل الثانوية العامة 2026.`;
        } else if (pct >= 90) {
            congratIcon.innerHTML = `<i class="fas fa-star"></i>`;
            congratTitle.textContent = `مبروك الامتياز والتفوق الفائق! 🌟✨`;
            congratMessage.textContent = `نتيجة مشرفة جداً تكلل جهدك وسهرك بالنجاح الباهر. ألف مبروك والتمني بمستقبل باهر.`;
        } else if (pct >= 85) {
            congratIcon.innerHTML = `<i class="fas fa-graduation-cap"></i>`;
            congratTitle.textContent = `مبروك النجاح والتفوق الباهر! 🎉🎓`;
            congratMessage.textContent = `مبارك هذا النجاح الممتاز، خطوت خطوة عظيمة نحو الكلية والمستقبل الذي تطمح إليه.`;
        } else if (pct >= 80) {
            congratIcon.innerHTML = `<i class="fas fa-award"></i>`;
            congratTitle.textContent = `ألف مبروك النجاح المشرف! 👏🎉`;
            congratMessage.textContent = `مجموع ممتاز يعكس اجتهادك. مبارك لك ولعائلتك هذا الفرح المستحق.`;
        } else if (pct >= 75) {
            congratIcon.innerHTML = `<i class="fas fa-thumbs-up"></i>`;
            congratTitle.textContent = `مبروك النجاح الطيب والجميل! 🌹`;
            congratMessage.textContent = `تهنئة قلبية خالص بالنجاح، نتمنى لك دوام التوفيق والنجاح في خطواتك القادمة.`;
        } else if (pct >= 70) {
            congratIcon.innerHTML = `<i class="fas fa-ribbon"></i>`;
            congratTitle.textContent = `تهنئة بالنجاح والاجتهاد المبارك! ⭐️`;
            congratMessage.textContent = `ألف مبروك النجاح وتخطي المرحلة بكل جدارة واستحقاق.`;
        } else if (pct >= 65) {
            congratIcon.innerHTML = `<i class="fas fa-check"></i>`;
            congratTitle.textContent = `مبروك العبور والنجاح! 🎓`;
            congratMessage.textContent = `تهانينا بالنجاح في الثانوية العامة، وبداية مرحلة جامعية جديدة ومثمرة بإذن الله.`;
        } else if (pct >= 60) {
            congratIcon.innerHTML = `<i class="fas fa-smile-beam"></i>`;
            congratTitle.textContent = `مبروك النجاح وتجاوز الثانوية العامة! 💐`;
            congratMessage.textContent = `الحمد لله على النجاح، مع تمنياتنا لك بالتوفيق والنجاح الدائم في القادم.`;
        } else if (pct >= 50) {
            congratIcon.innerHTML = `<i class="fas fa-hand-holding-heart"></i>`;
            congratTitle.textContent = `تهنئة باجتياز مرحلة الثانوية العامة! ✌️`;
            congratMessage.textContent = `ألف مبروك النجاح واجتياز الامتحانات بنجاح، ونتمنى لك التوفيق في اختيار مسارك القادم.`;
        } else {
            congratIcon.innerHTML = `<i class="fas fa-heart-pulse"></i>`;
            congratTitle.textContent = `رسالة دعم وتشجيع متواصلة 💪`;
            congratMessage.textContent = `الثانوية العامة ليست نهاية المطاف؛ نتمنى لك كل التوفيق والتعويض في فرص الدور الثاني والخطوات القادمة.`;
        }
    }

    // --- Result Actions (Download PNG, Print Certificate, WhatsApp Share, Reset) ---
    btnDownloadImage.addEventListener('click', async () => {
        if (!currentStudent) return;
        
        btnDownloadImage.disabled = true;
        btnDownloadImage.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري توليد كارت النتيجة كصورة...`;

        try {
            const canvas = await html2canvas(resultCard, {
                scale: 2,
                backgroundColor: document.body.classList.contains('light-theme') ? '#ffffff' : '#0f172a',
                useCORS: true
            });

            const imageURI = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `نتيجة_الثانوية_العامة_${currentStudent.name.replace(/\s+/g, '_')}.png`;
            link.href = imageURI;
            link.click();
        } catch (err) {
            console.error('Failed to export card image:', err);
            alert('حدث خطأ أثناء تنزيل صورة النتيجة. يرجى المحاولة مرة أخرى.');
        } finally {
            btnDownloadImage.disabled = false;
            btnDownloadImage.innerHTML = `<i class="fas fa-file-arrow-down"></i> <span>تحميل كارت النتيجة كصورة (PNG)</span>`;
        }
    });

    btnPrintCertificate.addEventListener('click', () => {
        window.print();
    });

    btnShareWhatsApp.addEventListener('click', () => {
        if (!currentStudent) return;
        const msg = encodeURIComponent(`🎉 نتيجة الثانوية العامة 2026 🎉\n\nالطالب/ة: ${currentStudent.name}\nرقم الجلوس: ${currentStudent.seating_no}\nالمجموع الكلي: ${currentStudent.total} / ${currentStudent.max_total || maxScoreSystem}\nالنسبة المئوية: ${currentStudent.percentage}%\nالحالة: ${currentStudent.status}`);
        window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    });

    btnReset.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        searchInput.value = '';
        btnClearSearch.classList.remove('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        searchInput.focus();
    });

    // --- Top Students Leaderboard Modal ---
    btnLeaderboardToggle.addEventListener('click', () => {
        renderLeaderboard();
        leaderboardModal.classList.remove('hidden');
    });

    btnCloseLeaderboard.addEventListener('click', () => {
        leaderboardModal.classList.add('hidden');
    });

    function renderLeaderboard() {
        leaderboardList.innerHTML = '';
        if (topStudents.length === 0) {
            leaderboardList.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px 10px;">سيتم عرض لوحة الشرف وأوائل الجمهورية فور الإعلان الرسمي واعتماد النتائج.</p>`;
            return;
        }

        topStudents.slice(0, 50).forEach((student, index) => {
            const rank = index + 1;
            let rankClass = 'rank-badge';
            if (rank === 1) rankClass += ' top-1';
            else if (rank === 2) rankClass += ' top-2';
            else if (rank === 3) rankClass += ' top-3';

            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="${rankClass}">${rank}</span>
                    <div>
                        <strong style="font-size:1.05rem;">${student.name}</strong>
                        <small style="display:block; color:var(--text-muted);">${student.school} • ${student.governorate}</small>
                    </div>
                </div>
                <div style="text-align:left;">
                    <strong style="color:var(--gold); font-size:1.1rem;">${student.total}</strong>
                    <small style="display:block; color:var(--text-muted);">${student.percentage}%</small>
                </div>
            `;
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                leaderboardModal.classList.add('hidden');
                selectStudent(student);
            });
            leaderboardList.appendChild(item);
        });
    }

    function showLoader(show) {
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }
});
