const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getFieldError({ name, value, required = false, type = "text" }) {
  const trimmedValue = String(value ?? "").trim();

  if (required && !trimmedValue) {
    return `${name}を入力してください。`;
  }

  if (type === "email" && trimmedValue && !EMAIL_PATTERN.test(trimmedValue)) {
    return "メールアドレスの形式を確認してください。";
  }

  return "";
}

export function validateEntries(entries) {
  return entries.map((entry) => ({
    ...entry,
    error: getFieldError(entry),
  }));
}

function setFieldState(field, message) {
  const wrapper = field.closest(".field");
  const hint = wrapper?.querySelector(".field__message");

  if (!wrapper || !hint) {
    return;
  }

  if (message) {
    wrapper.dataset.valid = "false";
    hint.textContent = message;
    return;
  }

  if (String(field.value ?? "").trim()) {
    wrapper.dataset.valid = "true";
    hint.textContent = "入力内容を確認しました。";
  } else {
    delete wrapper.dataset.valid;
    hint.textContent = "";
  }
}

function validateField(field) {
  const label = field.labels?.[0]?.textContent?.replace(/\s*\*$/, "") ?? "項目";
  const error = getFieldError({
    name: label,
    value: field.value,
    required: field.required,
    type: field.type,
  });

  setFieldState(field, error);
  return !error;
}

function mountForm() {
  const form = document.querySelector("[data-contact-form]");
  const dialog = document.querySelector("[data-success-dialog]");
  const closeButton = document.querySelector("[data-close-dialog]");

  if (typeof HTMLFormElement === "undefined" || !(form instanceof HTMLFormElement)) {
    return;
  }

  const fields = Array.from(form.elements).filter(
    (element) => (
      (typeof HTMLInputElement !== "undefined" && element instanceof HTMLInputElement)
      || (typeof HTMLTextAreaElement !== "undefined" && element instanceof HTMLTextAreaElement)
      || (typeof HTMLSelectElement !== "undefined" && element instanceof HTMLSelectElement)
    ),
  );

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      validateField(field);
    });

    field.addEventListener("input", () => {
      if (field.closest(".field")?.dataset.valid) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = fields.every((field) => validateField(field));

    if (!isValid) {
      const firstInvalid = fields.find(
        (field) => field.closest(".field")?.dataset.valid === "false",
      );
      firstInvalid?.focus();
      return;
    }

    // フォームの値を取得
const inquiryTypeMap = {
  "internet":       "インターネットの設置",
  "boot-controller":"Boot-controller",
  "iot":            "IoT機器の設置・設定",
  "other":          "その他",
};

const buildingTypeMap = {
  "new-build":   "新築",
  "renovation":  "既存物件の改修",
  "portfolio":   "複数棟管理",
};

const companyVal  = form.querySelector("#company")?.value.trim() ?? "";
const emailVal    = form.querySelector("#email")?.value.trim() ?? "";
const buildingVal = form.querySelector("#building-type")?.value ?? "";
const inquiryVal  = form.querySelector("#inquiry-type")?.value ?? "";
const unitsVal    = form.querySelector("#units")?.value.trim() ?? "";
const messageVal  = form.querySelector("#message")?.value.trim() ?? "";

const submitBtn = form.querySelector("[type='submit']");
if (submitBtn) {
  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";
}

fetch("https://test.cvr-world.com/api/contact-inquiries", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    form_type:            3,
    last_name:            companyVal, // 姓名がないので会社名を代用
    first_name:           "",
    email:                emailVal,
    company_name:         companyVal,
    phone_number:         null,
    property_type:        buildingTypeMap[buildingVal] ?? buildingVal,
    unit_count_estimate:  unitsVal || null,
    inquiry_items:        [inquiryTypeMap[inquiryVal] ?? inquiryVal],
    message:              messageVal,
  }),
})
.then((res) => {
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
})
.then(() => {
  form.reset();
  fields.forEach((field) => setFieldState(field, ""));
  if (typeof HTMLDialogElement !== "undefined" && dialog instanceof HTMLDialogElement) {
    dialog.showModal();
  }
})
.catch((err) => {
  console.error("送信エラー:", err);
  alert("送信に失敗しました。時間をおいて再度お試しください。");
})
.finally(() => {
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "無料相談を送信";
  }
});
  });

  closeButton?.addEventListener("click", () => {
    if (typeof HTMLDialogElement !== "undefined" && dialog instanceof HTMLDialogElement) {
      dialog.close();
    }
  });
}

function mountMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const menuLinks = mobileNav?.querySelectorAll("a") ?? [];

  if (
    typeof HTMLButtonElement === "undefined"
    || typeof HTMLElement === "undefined"
    || !(toggle instanceof HTMLButtonElement)
    || !(mobileNav instanceof HTMLElement)
  ) {
    return;
  }

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
    mobileNav.dataset.open = "false";
  };

  const openMenu = () => {
    toggle.setAttribute("aria-expanded", "true");
    mobileNav.hidden = false;
    mobileNav.dataset.open = "true";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

function mountScrollProgress() {
  const progressBar = document.querySelector("[data-scroll-progress]");
  if (typeof HTMLElement === "undefined" || !(progressBar instanceof HTMLElement)) {
    return;
  }

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.width = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
  };

  updateProgress();
  document.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function mountReveals() {
  const targets = document.querySelectorAll("[data-reveal]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  targets.forEach((target) => observer.observe(target));
}

function mountCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    counters.forEach((counter) => {
      if (typeof HTMLElement === "undefined" || !(counter instanceof HTMLElement)) {
        return;
      }

      counter.textContent = Number(counter.dataset.target ?? 0).toLocaleString("ja-JP");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
          return;
        }

        const targetValue = Number(entry.target.dataset.target ?? 0);
        const duration = 1100;
        const start = performance.now();

        const step = (timestamp) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          entry.target.textContent = Math.round(targetValue * eased).toLocaleString("ja-JP");

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function mountCascade() {
  const cascadeElements = document.querySelectorAll("[data-cascade]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    cascadeElements.forEach((el) => {
      el.querySelectorAll("span").forEach((span) => span.classList.add("is-visible"));
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const spans = Array.from(entry.target.querySelectorAll("span"));
        spans.forEach((span, index) => {
          setTimeout(() => {
            span.classList.add("is-visible");
          }, index * 120);
        });

        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 },
  );

  cascadeElements.forEach((el) => observer.observe(el));
}

function init() {
  mountMenu();
  mountForm();
  mountScrollProgress();
  mountReveals();
  mountCounters();
  mountCascade();
}

if (typeof document !== "undefined") {
  init();
}
