window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}


function nextRight(button) {
    const p = button.parentNode;
    const cards = p.getElementsByClassName("card");
    for (let i=0; i<cards.length; i++) {
      if (cards[i].classList.contains("active")) {
        if (i + 1 == cards.length) {
          cards[0].classList.add("active");
        } else {
          cards[i+1].classList.add("active");
        }
        cards[i].classList.remove("active");
        break;
      }
    }
  }

  function nextLeft(button) {
    const p = button.parentNode;
    const cards = p.getElementsByClassName("card");
    for (let i=0; i<cards.length; i++) {
      if (cards[i].classList.contains("active")) {
        if (i - 1 == -1) {
          cards[cards.length-1].classList.add("active");
        } else {
          cards[i-1].classList.add("active");
        }
        cards[i].classList.remove("active");
        break;
      }
    }
  }
