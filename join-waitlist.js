import gsap from "gsap";
import FirebaseService from "./firebase";

function userChoiceIndicator() {
  const form = document.querySelector("form");
  const labels = document.querySelectorAll("form .user-type label");
  const indicator = document.getElementById("user-choice-indicator");

  const instructorOnly = document.getElementById("instructor-only-field");
  const studentOnly = document.getElementById("student-only-field");

  function initiIndicator() {
    const height = labels[0].clientHeight;
    const width = labels[0].clientWidth;

    indicator.style.height = `${height}px`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = `1`;
    indicator.style.left = `0px`;
  }

  initiIndicator();

  labels.forEach((label) => {
    label.onclick = (e) => {
      const height = label.clientHeight;
      const width = label.clientWidth;
      const formLeft = form.getBoundingClientRect().left;
      const left = label.getBoundingClientRect().left - 1 - formLeft;

      indicator.style.height = `${height}px`;
      indicator.style.width = `${width}px`;
      indicator.style.left = `${left}px`;
      indicator.style.opacity = `1`;

      if (label.getAttribute("for") === "instructor") {
        instructorOnly.style.display = "flex";
        studentOnly.style.display = "none";

        instructorOnly.children[1].setAttribute("required", true);
        studentOnly.children[1].removeAttribute("required");
      } else {
        instructorOnly.style.display = "none";
        studentOnly.style.display = "flex";

        instructorOnly.children[1].removeAttribute("required");
        studentOnly.children[1].setAttribute("required", true);
      }
    };
  });
}

function loadCategories() {
  const instructorCategpry = document.getElementById("category");
  const categories = [
    "AI",
    "Advertising",
    "Business",
    "Branding",
    "Design",
    "Data",
    "Development",
    "Engineering",
    "Film",
    "Health & Fitness",
    "Investing",
    "Leadership",
    "Lifestyle",
    "Marketing",
    "Productivity",
    "Product",
    "Photography & Video",
    "Strategy",
    "Software",
    "Sales",
  ];

  for (let catergory of categories) {
    const option = document.createElement("option");
    option.setAttribute("value", catergory.toLowerCase());
    option.innerHTML = catergory;
    instructorCategpry.appendChild(option);
  }
}

async function loadCountries() {
  const { VITE_COUNTRIES_API_ENDPOINT } = import.meta.env;
  const countrySelect = document.getElementById("country");

  const response = await fetch(VITE_COUNTRIES_API_ENDPOINT);
  const data = await response.json();

  const countries = data.map((country) => country.name.common).sort();

  for (let country of countries) {
    const option = document.createElement("option");
    option.setAttribute("value", country.toLowerCase());
    option.innerHTML = country;
    countrySelect.appendChild(option);
  }
}

async function handleFormSubmit() {
  const form = document.getElementById("wait-list-form");
  const emailErrorHelper = document.getElementById("email-error-helper");
  const emailField = document.getElementById("email");
  const closeWaitlistModal = document.getElementById("close-wait-list-modal");
  const formSubmitButton = document.getElementById("form-submit-button");

  form.onsubmit = async (e) => {
    e.preventDefault();
    emailErrorHelper.style.opacity = "0";

    formSubmitButton.style.opacity = "0.7";
    formSubmitButton.style.pointerEvents = "none";
    formSubmitButton.children[0].style.opacity = "0";
    formSubmitButton.children[1].style.opacity = "1";

    try {
      const formData = new FormData(form);
      const email = formData.get("email");

      const result = await FirebaseService.validateEmail(email);

      if (result) {
        emailErrorHelper.style.opacity = "1";
        emailField.value = "";
      } else {
        const payload = {
          user: formData.get("user"),
          firstname: formData.get("first-name"),
          lastname: formData.get("last-name"),
          email,
          country: formData.get("country"),
          category: formData.get("category"),
          what_to_learn: formData.get("what-to-learn"),
        };

        await FirebaseService.submitForm(payload);
        openWaitListModal();
        form.reset();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      formSubmitButton.style.opacity = "1";
      formSubmitButton.style.pointerEvents = "auto";
      formSubmitButton.children[0].style.opacity = "1";
      formSubmitButton.children[1].style.opacity = "0";
    }
  };

  closeWaitlistModal.onclick = () => {
    closeWaitListmodal();
  };
}

function openWaitListModal() {
  const timeline = gsap.timeline();

  timeline
    .to("#success-modal", { y: 0, ease: "expo.out", duration: 1.5 })
    .to(
      "#success-modal #modal-content",
      {
        scale: 1,
        opacity: 1,
        y: 0,
        ease: "expo.out",
        duration: 1.5,
      },
      "-=1"
    )
    .from(
      "#success-modal #modal-content > div > *",
      {
        opacity: 0,
        y: 200,
        ease: "expo.out",
        duration: 2,
        stagger: 0.125,
      },
      "-=1"
    );
}

function closeWaitListmodal() {
  const timeline = gsap.timeline();

  timeline
    .to("#success-modal #modal-content", { scale: 0.7, opacity: 0 })
    .to("#success-modal", { y: "100%", ease: "expo.out", duration: 1.5 });
}

function animation() {
  const timeline = gsap.timeline({
    delay: 1,
  });

  timeline
    .to("header h1 .word", {
      y: 0,
      opacity: 1,
      stagger: { each: 0.05, from: "start" },
      ease: "power3.out",
      duration: 0.8,
    })
    .to(
      "header .line",
      {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "power3.out",
        duration: 1,
        stagger: { each: 0.1, from: "start" },
      },
      "-=0.75"
    )
    .from(
      "form > *",
      {
        opacity: 0,
        y: "200%",
        ease: "power3.out",
        duration: 1,
      },
      "-=1"
    );
}

window.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadCountries();
});

window.addEventListener("load", () => {
  userChoiceIndicator();
  handleFormSubmit();

  animation();
});
