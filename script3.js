document.addEventListener('DOMContentLoaded', () => {

    const data = JSON.parse(sessionStorage.getItem("leetcodeData")) || {};
    const $ = (id) => document.getElementById(id);
    const CIRC = 2 * Math.PI * 52;

    function getsolvePercentage(solved, total) {
        return total ? Math.min(solved / total, 1) : 0;
    }

    async function getToataldata() {
        const url = 'https://leetcode-api-pied.vercel.app/stats';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Incorrect new url");
            return await response.json();
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    function drawRing(ringId, solvedId, totalId, solved, total) {
        $(solvedId).textContent = solved;
        $(totalId).textContent = total;
        const bar = document.querySelector(`#${ringId} .bar`);
        bar.style.strokeDasharray = CIRC;
        gsap.fromTo(bar,
            { strokeDashoffset: CIRC },
            { strokeDashoffset: CIRC * (1 - getsolvePercentage(solved, total)), duration: 1.4, ease: "power2.out", delay: .3 });
    }

    async function displayuserdata(d) {
        $("username").textContent = d.username || "User Name";
        document.title = d.username || "Profile | Overview";
        if (d.profile?.userAvatar) $("avatar").src = d.profile.userAvatar;
        $("ranking").textContent = d.profile?.ranking ?? "N/A";

        const solved = d.submitStats?.acSubmissionNum || [];
        const count = (i) => solved[i]?.count ?? 0;
        const all = await getToataldata();
        const by = all?.by_difficulty || {};

        drawRing("ring-total", "totalquestionsolved", "totalQuestion", count(0), all?.total ?? 0);
        drawRing("ring-easy", "easySolved", "easyTotal", count(1), by.easy ?? 0);
        drawRing("ring-med", "medSolved", "medTotal", count(2), by.medium ?? 0);
        drawRing("ring-hard", "hardSolved", "hardTotal", count(3), by.hard ?? 0);

        renderSocials(d);
        renderHeatmap(d);
    }

    function renderSocials(d) {
        const p = { ...(d.profile || {}), ...d };
        const list = [
            ["githubUrl", "fa-brands fa-github", "GitHub"],
            ["linkedinUrl", "fa-brands fa-linkedin", "LinkedIn"],
            ["twitterUrl", "fa-brands fa-x-twitter", "X / Twitter"],
            ["website", "fa-solid fa-globe", "Website"]
        ];
        const ul = $("socials");
        let found = 0;
        list.forEach(([key, icon, label]) => {
            let url = Array.isArray(p[key]) ? p[key][0] : p[key];
            if (!url) return;
            if (!/^https?:\/\//.test(url)) url = "https://" + url;
            found++;
            const li = document.createElement("li");
            li.innerHTML = `<a href="${url}" target="_blank" rel="noopener"><i class="${icon}"></i>${label}</a>`;
            ul.appendChild(li);
        });
        if (!found) ul.innerHTML = '<li class="none">No social links added.</li>';
    }

    function renderHeatmap(d) {
        let cal = d.submissionCalendar || d.profile?.submissionCalendar || d.userCalendar?.submissionCalendar || {};
        if (typeof cal === "string") { try { cal = JSON.parse(cal); } catch { cal = {}; } }

        const grid = $("heatmap");
        const now = new Date();
        let total = 0;
        for (let i = 29; i >= 0; i--) {
            const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
            const n = Number(cal[Math.floor(day.getTime() / 1000)] || 0);
            total += n;
            const cell = document.createElement("span");
            cell.className = n >= 6 ? "l3" : n >= 3 ? "l2" : n >= 1 ? "l1" : "";
            cell.title = `${day.toISOString().slice(0, 10)}: ${n} submissions`;
            grid.appendChild(cell);
        }
        $("monthCount").textContent = total;
    }

    displayuserdata(data);


    const slider = document.querySelector('.slider');
    const slides = gsap.utils.toArray('.slider .slide');
    const n = slides.length;
    const step = 360 / n;
    let index = 0;
    let timer;

    function fade() {
        const rot = gsap.getProperty(slider, "rotationY");
        slides.forEach((s, i) => {
            const facing = Math.cos(((i * step + rot) * Math.PI) / 180);
            gsap.set(s, { opacity: 0.2 + 0.8 * Math.max(0, facing), pointerEvents: facing > 0.7 ? "auto" : "none" });
        });
    }

    function layout() {
        const w = slides[0].offsetWidth;
        const radius = Math.round((w / 2) / Math.tan(Math.PI / n)) + 24;
        gsap.set(slider, { transformOrigin: `50% 50% ${-radius}px`, rotationY: -index * step });
        slides.forEach((s, i) => gsap.set(s, { rotationY: i * step, transformOrigin: `50% 50% ${-radius}px` }));
        fade();
    }

    function go(dir) {
        index += dir;
        gsap.to(slider, { rotationY: -index * step, duration: 1, ease: "power3.inOut", onUpdate: fade });
    }

    function autoplay() {
        clearInterval(timer);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        timer = setInterval(() => go(1), 5000);
    }

    $("next").addEventListener("click", () => { go(1); autoplay(); });
    $("prev").addEventListener("click", () => { go(-1); autoplay(); });
    document.querySelector(".scene").addEventListener("mouseenter", () => clearInterval(timer));
    document.querySelector(".scene").addEventListener("mouseleave", autoplay);
    window.addEventListener("resize", layout);

    layout();
    autoplay();
});