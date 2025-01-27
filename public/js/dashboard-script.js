document.addEventListener("DOMContentLoaded", () => {
  const rewardMessage =
    document.getElementById("rewardMessage").dataset.message;
  const rewardError = document.getElementById("rewardError").dataset.error;

  if (rewardMessage || rewardError) {
    const modal = document.querySelector('[data-modal="modal2"]');
    if (modal) {
      modal.showModal();
    }
  }

  const openElements = document.querySelectorAll("[data-open-modal]");
  const modals = document.querySelectorAll("[data-modal]");

  openElements.forEach((element) => {
    element.addEventListener("click", (event) => {
      const modalId = element.getAttribute("data-open-modal");
      const modal = document.querySelector(`[data-modal="${modalId}"]`);
      if (modal) {
        modal.showModal();
      }
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      const dialogDimensions = modal.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        modal.close();
      }
    });
  });

  const rewardOptions = {
    yogaCategory: [
      "1 Group Class Drop-in",
      "1-week unlimited Class Tickets",
      "1 Month Unlimited",
      "Healthy Day",
      "Healthy Morning/ Afternoon",
      "Private Class 1-on-1",
    ],
    fnbCategory: [
      "Free Breakfast or Dinner Set",
      "Free Signature Juices or Smoothies",
      "Free Coffee or Tea",
      "Free Raw Cheesecake",
    ],
    vitaSpaCategory: [
      "Any massages/Treatments 60mn",
      "Any massages/Treatments 90mn",
      "Free upgrade 30 min massage",
    ],
    retreatsCategory: ["Room upgrade", "Free room night"],
  };

  const categorySelect = document.getElementById("category");
  const rewardSelect = document.getElementById("reward");

  const updateRewards = (selectedCategory) => {
    rewardSelect.innerHTML = "";

    const rewards = rewardOptions[selectedCategory];

    if (rewards) {
      rewards.forEach((reward) => {
        const option = document.createElement("option");
        option.value = reward;
        option.textContent = reward;
        rewardSelect.appendChild(option);
      });
    }
  };

  categorySelect.addEventListener("change", (event) => {
    const selectedCategory = event.target.value;
    updateRewards(selectedCategory);
  });

  updateRewards(categorySelect.value);

  const spendingType = document.getElementById("spendingType");
  const amount = document.getElementById("amount");
  if (spendingType && amount) {
    spendingType.addEventListener("change", function () {
      if (spendingType.value === "Annual Membership Fee") {
        amount.value = 1000;
        amount.readOnly = true;
      } else {
        amount.value = "";
        amount.readOnly = false;
      }
    });
  }
});
