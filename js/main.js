document.addEventListener("DOMContentLoaded", async function () {
    const mainCard = document.getElementById("mainCard");
    const leftCard = document.querySelector(".left-card");
    const rightCard = document.querySelector(".right-card");
    const progress = document.querySelector(".progress");
    const reviewBtn = document.getElementById("reviewBtn");
    const chapterBtn = document.getElementById("chapterBtn");
    const unknownBtn = document.getElementById("unknownBtn");
    const tipModal = document.getElementById("tipModal");
    const tipContent = document.getElementById("tipContent");
    const closeModal = document.getElementById("closeModal");
    const menuButton = document.getElementById("menuButton");
    const accordionMenu = document.getElementById("accordionMenu");
    const chapterItems = document.querySelectorAll(".chapter-item");

    let currentIndex = 0;
    let words = [];
    let unknownWords = [];
    let isReviewMode = false;
    let originalWords = [];
    let currentChapter = 1; // 기본 챕터 1
    let chapterTips = {}; // 챕터 설명 저장

    // 🔹 모달 기본적으로 숨기기 (자동 실행 방지)
    tipModal.style.display = "none";
    accordionMenu.style.display = "none";

    // 📌 배열 섞기 (Fisher-Yates Shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 📌 단어 데이터 불러오기
    async function loadWords(chapterNumber = 1) {
        try {
            console.log(`📚 Chapter ${chapterNumber} 데이터를 불러오는 중...`);
            const response = await fetch(`data/chapter${chapterNumber}.json`);
            words = await response.json();
            words = shuffleArray(words);
            originalWords = [...words];
            currentIndex = 0;
            console.log("📚 단어 데이터:", words);
            updateCards();
        } catch (error) {
            console.error(`❌ Chapter ${chapterNumber} 데이터를 불러오는 중 오류 발생:`, error);
        }
    }

    // 📌 챕터 설명 JSON 데이터 불러오기
    async function loadChapterTips() {
        try {
            console.log("📚 챕터 설명 데이터를 불러오는 중...");
            const response = await fetch("data/chapterTips.json");
            chapterTips = await response.json();
            console.log("📚 불러온 챕터 설명 데이터:", chapterTips);
        } catch (error) {
            console.error("❌ 챕터 설명을 불러오는 중 오류 발생:", error);
        }
    }

    // 📌 카드 업데이트
    function updateCards() {
        if (words.length === 0) return;

        const word = words[currentIndex];

        mainCard.textContent = word.kanji;
        mainCard.dataset.kanji = word.kanji;
        mainCard.dataset.hiragana = word.hiragana;
        mainCard.dataset.meaning = word.meaning;
        mainCard.dataset.flipped = "false";

        progress.textContent = `${currentIndex + 1} / ${words.length}`;

        leftCard.textContent = currentIndex > 0 ? words[currentIndex - 1].kanji : "";
        rightCard.textContent = currentIndex < words.length - 1 ? words[currentIndex + 1].kanji : "";

        reviewBtn.classList.toggle("hidden", !isReviewMode && currentIndex !== words.length - 1);
    }

    // 📌 카드 넘기기 기능
    rightCard.addEventListener("click", function () {
        if (currentIndex < words.length - 1) {
            currentIndex++;
            animateCardTransition();
        }
    });

    leftCard.addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
            animateCardTransition();
        }
    });

    function animateCardTransition() {
        mainCard.style.transform = "scale(1)";
        setTimeout(() => {
            updateCards();
            mainCard.style.transform = "scale(1.2)";
        }, 300);
    }

    // 📌 카드 클릭 시 정답(히라가나 + 의미) 표시
    mainCard.addEventListener("click", function () {
        if (mainCard.dataset.flipped === "false") {
            mainCard.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center;">
                <span>${mainCard.dataset.hiragana}</span>
                <span style="font-size: 16px; color: gray;">${mainCard.dataset.meaning}</span>
            </div>`;
            mainCard.dataset.flipped = "true";
        } else {
            mainCard.textContent = mainCard.dataset.kanji;
            mainCard.dataset.flipped = "false";
        }
    });

    // 📌 모르는 단어 저장 기능
    unknownBtn.addEventListener("click", function () {
        const currentWord = words[currentIndex];
        if (!unknownWords.some(word => word.kanji === currentWord.kanji)) {
            unknownWords.push(currentWord);
        }

        // 버튼 피드백 효과
        unknownBtn.style.opacity = "0.5";
        setTimeout(() => {
            unknownBtn.style.opacity = "1";
        }, 200);
    });

    // 📌 복습 모드 시작
    function startReviewMode() {
        if (unknownWords.length === 0) {
            alert("복습할 단어가 없습니다!");
            return;
        }

        isReviewMode = true;
        words = [...unknownWords];
        currentIndex = 0;
        updateCards();
    }

    // 📌 복습 모드 종료
    function exitReviewMode() {
        isReviewMode = false;
        words = [...originalWords];
        currentIndex = 0;
        updateCards();
    }

    // 📌 복습 버튼 클릭 이벤트
    reviewBtn.addEventListener("click", function () {
        if (isReviewMode) {
            exitReviewMode();
        } else {
            startReviewMode();
        }
    });

    // 📌 모달 창 열기
    chapterBtn.addEventListener("click", function () {
        console.log(`📘 Chapter ${currentChapter} 모달 열기`);
        const tipText = chapterTips[`chapter${currentChapter}`] || "챕터 설명을 찾을 수 없습니다.";
        tipContent.innerHTML = tipText.replace(/\n/g, "<br>");
        tipModal.style.display = "flex";
    });

    // 📌 모달 닫기
    closeModal.addEventListener("click", function () {
        tipModal.style.display = "none";
    });

    tipModal.addEventListener("click", function (event) {
        if (event.target === tipModal) {
            tipModal.style.display = "none";
        }
    });

    // 📌 아코디언 메뉴 열기/닫기
    menuButton.addEventListener("click", function () {
        console.log("☰ 버튼 클릭됨!");
        if (accordionMenu.style.display === "none") {
            accordionMenu.style.display = "block";
        } else {
            accordionMenu.style.display = "none";
        }
    });

    // 📌 챕터 변경 기능
    chapterItems.forEach(item => {
        item.addEventListener("click", function () {
            const selectedChapter = this.dataset.chapter;
            currentChapter = selectedChapter;

            chapterBtn.textContent = `Chapter ${currentChapter} tip`;
            loadWords(currentChapter);

            // 아코디언 메뉴 닫기
            accordionMenu.style.display = "none";
        });
    });

    // 📌 초기 데이터 로드
    await loadWords(1);
    await loadChapterTips();
});
