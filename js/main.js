"use strict"

function setWindowDimensions(width, height) {
  if (window.innerWidth / window.innerHeight > width / height) {
    document.body.style.transform = "translateX(" + ((window.innerWidth - (width / height * window.innerHeight)) / 2) + "px)" + " scale(" + window.innerHeight / height + ")";
  } else {
    document.body.style.transform = "translateY(" + ((window.innerHeight - (height / width * window.innerWidth)) / 2) + "px)" + " scale(" + window.innerWidth / width + ")";
  }
}

setWindowDimensions(1366, 768);

window.addEventListener("resize", function () {
  setWindowDimensions(1366, 768);
});

var game = {
  p1name: "Player 1",
  p2name: "Player 2",
  p1lp: 8000,
  p2lp: 8000,
  turn: 1,
  phase: "DP",
  p1deck: [],
  p2deck: [],
  p1fusdeck: [2],
  p2fusdeck: [],
  p1hand: [],
  p2hand: [],
  p1grave: [],
  p2grave: [],
  p1mzone: [
    // sample:
    //    {
    //      id:  0, // Card id
    //      pos: 0, // 0: face-up attack position, 1: face-up defense position, 2: face-down
    //      atk: 0, // Attack
    //      def: 0, // Defense
    //      turnPosSet: 1 // Turn on which the card position was last set
    //    },
    0,
    0,
    0,
    0,
    0
  ],
  p2mzone: [0, 0, 0, 0, 0],
  p1stzone: [0, 0, 0, 0, 0],
  p2stzone: [0, 0, 0, 0, 0],
  p1swords: [0, 0, 0, 0, 0],
  p2swords: [0, 0, 0, 0, 0],
  p1CurrentSword: 0, // The currently selected sword
  chain: [], // The current chain of activated cards
  status: "busy", // idle, busy, playing, activating, tributing, discard, diagSelect
  reqTribs: 0,
  selectedTribs: [],
  selectedTribIds: [],
  cardToTribPlay: {
    id: 0,
    elem: 0,
    pos: 0
  },
  atkmonster: {
    id: 0,
    zone: 0,
    atk: 0,
    def: 0
  },
  atktarget: {
    id: 0,
    player: 0,
    zone: 0,
    pos: 0,
    atk: 0,
    def: 0
  },
  selectedCards: {
    count: 0,
    players: [],
    zones: [],
    types: [],
    cards: [],
    elems: [],
    initialize: function () {
      this.count = 0;
      this.players = [];
      this.zones = [];
      this.types = [];
      this.cards = [];
      this.elems = [];
    }
  },
  activatedCard: {
    id: 0,
    zone: 0,
    elem: 0
  },
  playedMonster: {
    id: 0,
    zone: 0,
    elem: 0,
    player: 0,
    pos: 0
  },
  selectedPos: 0,
  reopenLastDiag: function () {
    return 0;
  },
  fieldSelectCondition: function () {
    return 0;
  },
  afterOkDiag: function () {
    return 0;
  },
  afterYesNoDiagYes: function () {
    return 0;
  },
  afterYesNoDiagNo: function () {
    return 0;
  },
  afterDiscardDiag: function () {
    return 0;
  },
  afterSelectDiagCards: function () {
    return 0;
  },
  afterPosDiag: function () {
    return 0;
  },
  afterSelectFieldCards: function () {
    return 0;
  },
  afterDamage: function () {
    return 0;
  },
  cardOnHover: 0,
  perm: {
    p1CanSummon: 0,
    p1CanSet: 0,
    p1PlayableMonsters: 0,
    p1CanChangePhaseTo: []
  }
};

var p1lp = document.querySelector(".wrapper.p1 .info .lpcount");
var p1lpbar = document.querySelector(".wrapper.p1 .info .lpbar .fluid");
var p2lp = document.querySelector(".wrapper.p2 .info .lpcount");
var p2lpbar = document.querySelector(".wrapper.p2 .info .lpbar .fluid");

var availDeckCards = [1, 1, 3, 3, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 26, 27, 28, 29, 30, 31, 32, 33, 33, 34, 35, 36, 37];
var availFusionCards = [2];

game.p1deck = shuffle(availDeckCards);
game.p1fusdeck = shuffle(availFusionCards);

game.p2deck = shuffle(availDeckCards);
game.p2fusdeck = shuffle(availFusionCards);

var cardWidth = 200;
var cardSpacing = 10;

var field = document.querySelector(".field");

function alignCards(player) {
  if (player == 1) {
    var p1handcards = document.querySelectorAll(".field .p1hand");
    var fieldWidth = document.querySelector(".field").offsetWidth;
    var cardSpace = p1handcards.length * cardWidth + (p1handcards.length - 1) * cardSpacing;
    if (p1handcards.length > 0) {
      if (fieldWidth - 200 >= cardSpace) {
        p1handcards[0].style.left = (fieldWidth - cardSpace) / 2 + "px";
        for (var i = 1; i < p1handcards.length; i++) {
          p1handcards[i].style.left = (cardWidth + cardSpacing) * i + Number(p1handcards[0].style.left.slice(0, -2)) + "px";
        }
      } else {
        p1handcards[0].style.left = "100px";
        var leftOffset = (fieldWidth - 200 - cardWidth) / (p1handcards.length - 1);
        for (var i = 1; i < p1handcards.length; i++) {
          p1handcards[i].style.left = leftOffset * i + 100 + "px";
        }
      }
    }
  } else if (player == 2) {
    var p2handcards = document.querySelectorAll(".field .p2hand");
    var fieldWidth = document.querySelector(".field").offsetWidth;
    var cardSpace = p2handcards.length * cardWidth + (p2handcards.length - 1) * cardSpacing;
    if (p2handcards.length > 0) {
      if (fieldWidth - 200 >= cardSpace) {
        p2handcards[p2handcards.length - 1].style.left = (fieldWidth - cardSpace) / 2 + "px";
        for (var i = 0; i < p2handcards.length; i++) {
          p2handcards[p2handcards.length - 1 - i].style.left = (cardWidth + cardSpacing) * i + Number(p2handcards[p2handcards.length - 1].style.left.slice(0, -2)) + "px";
        }
      } else {
        p2handcards[p2handcards.length - 1].style.left = "100px";
        var leftOffset = (fieldWidth - 200 - cardWidth) / (p2handcards.length - 1);
        for (var i = 1; i < p2handcards.length; i++) {
          p2handcards[p2handcards.length - 1 - i].style.left = leftOffset * i + 100 + "px";
        }
      }
    }
  }
}

window.addEventListener("resize", function () {
  alignCards(1);
  alignCards(2);
});

// pos values:
// 1 - face-up attack position
// 2 - face-down defense position
function playCard(card, pos, cardId) {
  // First of all, create and populate the card object if the card is a hand card
  var playedCard = {};
  if (card.className == "p1hand" || card.className == "p2hand") {
    // set the card id
    if (card.className == "p1hand") {
      cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
    }
    playedCard.id = cardId;
    // set the card position
    if (pos == 1) {
      playedCard.pos = 0;
    } else if (pos == 2) {
      playedCard.pos = 2;
    }
    // set the card atk and def
    var cardType = cards[cardId - 1][2];
    if (cardType != "Spell" && cardType != "Trap") {
      playedCard.atk = Number(cards[cardId - 1][7]);
      playedCard.def = Number(cards[cardId - 1][8]);
    }
    // set the turn on which the card was played
    playedCard.turnPosSet = game.turn;
  }

  if (card.className == "p1hand") {
    // Check if summons/sets are allowed
    if ((game.perm.p1PlayableMonsters > 0 && ((pos == 1 && game.perm.p1CanSummon) || (pos == 2 && game.perm.p1CanSet)) && cardType != "Spell" && cardType != "Trap") || (cardType == "Spell" && ((pos == 2 && checkMagicSetConditions(cardId)) || (pos == 1 && checkActivationConditions(cardId)))) || (cardType == "Trap" && checkMagicSetConditions(cardId))) {
      var firstEmptyZone;
      if (cardType == "Spell" || cardType == "Trap") {
        firstEmptyZone = getFirstEmptyZone(1, "s");
      } else {
        firstEmptyZone = getFirstEmptyZone(1, "m");
      }

      if (firstEmptyZone > 0) {
        if (cardType == "Spell" || cardType == "Trap") {
          game.p1stzone[firstEmptyZone - 1] = playedCard;
        } else {
          game.p1mzone[firstEmptyZone - 1] = playedCard;
          game.perm.p1PlayableMonsters--;
        }

        var cardIndex = Array.from(document.querySelectorAll(".p1hand")).indexOf(card);
        game.p1hand.splice(cardIndex, 1);

        if (pos == 1) {
          if (cardType == "Spell") {
            game.status = "activating";
            game.activatedCard.id = cardId;
            game.activatedCard.zone = firstEmptyZone;
            game.activatedCard.elem = card;
            card.className = "p1s" + firstEmptyZone;
            setTimeout(function () {
              card.classList.add("glow");
            }, 750);
            setTimeout(function () {
              card.classList.remove("glow");
            }, 1150);
            setTimeout(function () {
              var p1ActivatableTrapCards = game.p1stzone.filter(card => {
                return checkTrapActivationConditions(card.id);
              });
              if (p1ActivatableTrapCards.length > 0) {
                game.afterYesNoDiagYes = function () {
                  return 0;
                };
                showYesNoDiag("\"" + cards[game.activatedCard.id - 1][1] + "\" was activated. Resolve as part of a chain?", "false");
              } else {
                activateSpellCard(cardId);
              }
            }, 2150);
          } else if (cardType == "Trap") {
            game.status = "playing";
            hideTooltip();
            setTimeout(function () {
              game.status = "idle";
              showTooltip(game.cardOnHover);
            }, 700);
            card.className = "p1s" + firstEmptyZone;
          } else {
            game.status = "playing";
            hideTooltip();
            game.playedMonster.player = 1;
            game.playedMonster.id = cardId;
            game.playedMonster.pos = 0;
            game.playedMonster.zone = firstEmptyZone;
            game.playedMonster.elem = card;
            card.className = "p1m" + firstEmptyZone;
            setTimeout(function () {
              createFadeEffect(card);
              setTimeout(function () {
                game.status = "idle";
                showTooltip(game.cardOnHover);
              }, 1000);
            }, 200);
          }
        } else if (pos == 2) {
          if (cardType == "Spell" || cardType == "Trap") {
            game.status = "playing";
            hideTooltip();
            setTimeout(function () {
              game.status = "idle";
              showTooltip(game.cardOnHover);
            }, 700);
            card.className = "p1s" + firstEmptyZone + " stFaceDown";
          } else {
            game.status = "playing";
            hideTooltip();
            game.playedMonster.player = 1;
            game.playedMonster.id = cardId;
            game.playedMonster.pos = 2;
            game.playedMonster.zone = firstEmptyZone;
            game.playedMonster.elem = card;
            setTimeout(function () {
              game.status = "idle";
              showTooltip(game.cardOnHover);
            }, 700);
            card.className = "p1m" + firstEmptyZone + " mFaceDown";
          }
          setTimeout(function () {
            card.children[0].src = "img/cards/back.png";
          }, 68);
        }
        alignCards(1);
      } else {
        console.log("The monster card zone is full");
      }

    }
  } else if (card.className == "p2hand") {
    var firstEmptyZone;
    if (cardType == "Spell" || cardType == "Trap") {
      firstEmptyZone = getFirstEmptyZone(2, "s");
    } else {
      firstEmptyZone = getFirstEmptyZone(2, "m");
    }
    if (firstEmptyZone > 0) {
      if (cardType == "Spell" || cardType == "Trap") {
        game.p2stzone[firstEmptyZone - 1] = playedCard;
      } else {
        game.p2mzone[firstEmptyZone - 1] = playedCard;
      }

      cardIndex = Array.from(document.querySelectorAll(".p2hand")).indexOf(card);
      game.p2hand.splice(cardIndex, 1);

      if (pos == 1) {
        if (cardType == "Spell" || cardType == "Trap") {
          card.className = "p2s" + firstEmptyZone;
        } else {
          card.className = "p2m" + firstEmptyZone;
        }
        setTimeout(function () {
          card.children[0].src = "img/cards/" + cardId + ".png";
        }, 69);
      } else if (pos == 2) {
        if (cardType == "Spell" || cardType == "Trap") {
          card.className = "p2s" + firstEmptyZone + " stFaceDown";
        } else {
          card.className = "p2m" + firstEmptyZone + " mFaceDown";
        }
      }
    } else {
      console.log("The monster card zone is full");
    }
    alignCards(2);
  }
}

function playCardByClick(card) {
  if (!card.classList.contains("p1hand")) {
    return;
  }
  var cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
  var cardType = cards[cardId - 1][2];
  var cardLevel = cards[cardId - 1][6];
  if (cardType == "Spell" || cardType == "Trap") {
    if (cardTooltip.innerHTML == "ACTIVATE") {
      playCard(card, 1);
    } else if (cardTooltip.innerHTML == "SET") {
      if (checkMagicSetConditions(cardId)) {
        playCard(card, 2);
      }
    }
  } else {
    if (checkPlayConditions(cardId)) {
      if (cardLevel <= 4) {
        if (cardTooltip.innerHTML == "SUMMON") {
          playCard(card, 1);
        } else if (cardTooltip.innerHTML == "SET") {
          playCard(card, 2);
        }
      } else {
        var text1, text2;
        if (requiredTributes(cardId) == 1) {
          text1 = "1 tribute";
          text2 = "one monster";
        } else {
          text1 = "2 tributes";
          text2 = "two monsters";
        }
        game.afterYesNoDiagYes = function () {
          game.status = "tribute";
        };
        showYesNoDiag("Summoning this monster requires " + text1 + ". Would you like to tribute " + text2 + " to summon this monster?", "false");
        game.selectedTribs = [];
        game.selectedTribIds = [];
        game.cardToTribPlay.id = cardId;
        game.cardToTribPlay.elem = card;
        if (cardTooltip.innerHTML == "SUMMON") {
          game.cardToTribPlay.pos = 0;
        } else if (cardTooltip.innerHTML == "SET") {
          game.cardToTribPlay.pos = 2;
        }
        game.reqTribs = requiredTributes(cardId);
      }
    }
  }
}

function activateFieldCard(card) {
  var zone = card.className.match(/(?<=p1s)\d/);
  if (zone) {
    var cardId = game.p1stzone[zone - 1].id;
    var cardType = cards[cardId - 1][2];
    // only face-down spell cards can be activated
    if (cardType == "Spell" && checkActivationConditions(cardId, "field") && game.p1stzone[zone - 1].pos == 2) {
      game.p1stzone[zone - 1].pos = 0;
      game.status = "activating";
      game.activatedCard.id = cardId;
      game.activatedCard.zone = zone;
      game.activatedCard.elem = card;
      card.classList.remove("stFaceDown");
      setTimeout(function () {
        card.children[0].src = "img/cards/" + game.p1stzone[zone - 1].id + ".png";
      }, 68);
      setTimeout(function () {
        card.classList.add("glow");
      }, 750);
      setTimeout(function () {
        card.classList.remove("glow");
      }, 1150);
      setTimeout(function () {
        activateSpellCard(cardId);
      }, 2150);
    }
  }
}

// Checks for the first empty card zone
// player is either 1 or 2
// zone is either "m" or "s"
function getFirstEmptyZone(player, zone) {
  for (var i = 1; i < 6; i++) {
    if (!document.querySelector(".p" + player + zone + i)) {
      return i;
    }
  }
  return 0;
}

var allCards = document.querySelectorAll(".p1deck, .p2deck, .p1fusion, .p2fusion, .p1grave, .p2grave, .p1hand, .p2hand, .p1m1, .p1m2, .p1m3, .p1m4, .p1m5, .p1s1, .p1s2, .p1s3, .p1s4, .p1s5, .p2m1, .p2m2, .p2m3, .p2m4, .p2m5, .p2s1, .p2s2, .p2s3, .p2s4, .p2s5");

for (var i = 0; i < allCards.length; i++) {
  initializeCard(allCards[i]);
}

// Add appropriate event listeners to a card
function initializeCard(card) {
  card.addEventListener("click", function () {
    switchPos(this);
    playCardByClick(this);
    viewDiagCardClicked(this);
    discardFromHand(this);
    tribute(this);
  });
  card.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    switchTooltip(this);
  });
  card.addEventListener("mousedown", function () {
    selectFieldCard(this);
    activateFieldCard(this);
    selectSword(this);
    selectSwordTarget(this);
  });
  card.addEventListener("mouseover", function () {
    setCardView(this);
    showTooltip(this);
    showFieldTooltip(this);
  });
  card.addEventListener("mouseout", function () {
    hideTooltip();
    hideFieldTooltip();
    game.cardOnHover = 0;
  });
}

// Enable reopening of diag on right click
window.addEventListener("contextmenu", function () {
  event.preventDefault();
  game.reopenLastDiag();
});

function shuffleHand(player) {
  var handcards;
  if (player == 1) {
    handcards = document.querySelectorAll(".field .p1hand");
    for (var i = 0; i < handcards.length; i++) {
      handcards[i].classList.add("shuffle")
    }
    game.p1hand = shuffle(game.p1hand);
    setTimeout(function () {
      for (var i = 0; i < handcards.length; i++) {
        handcards[i].children[0].src = "img/cards/" + game.p1hand[i] + ".png";
      }
    }, 200);
    setTimeout(function () {
      for (var i = 0; i < handcards.length; i++) {
        handcards[i].classList.remove("shuffle");
      }
    }, 1200);
  } else if (player == 2) {
    handcards = document.querySelectorAll(".field .p2hand");
    for (var i = 0; i < handcards.length; i++) {
      handcards[i].classList.add("shuffle")
    }
    game.p2hand = shuffle(game.p2hand);
    setTimeout(function () {
      for (var i = 0; i < handcards.length; i++) {
        handcards[i].classList.remove("shuffle");
      }
    }, 1200);
  }
}

function drawCard(player) {
  if (player == 1 && game.p1deck.length > 0) {
    var card;
    // First create the card if there are more deck cards
    if (game.p1deck.length > 1) {
      card = document.createElement("div");
      card.className = "p1deck";
      card.style.left = "0px";
      var cardImg = document.createElement("img");
      cardImg.src = "img/cards/back.png";
      card.appendChild(cardImg);
      // Now initialize the card
      initializeCard(card);
      field.appendChild(card);
    } else {
      card = document.querySelector(".p1deck");
      card.style.left = "0px";
      field.appendChild(card);
    }
    var cardId = game.p1deck[0];
    setTimeout(function () {
      card.className = "p1hand";
      alignCards(1);
      game.p1hand.push(game.p1deck.splice(0, 1)[0]);
      setTimeout(function () {
        card.children[0].src = "img/cards/" + cardId + ".png";
      }, 74);
    }, 20);
  } else if (player == 2 && game.p2deck.length > 0) {
    var card
    // First create the card if there are more deck cards
    if (game.p2deck.length > 1) {
      var card = document.createElement("div");
      card.className = "p2deck";
      card.style.left = "0px";
      var cardImg = document.createElement("img");
      cardImg.src = "img/cards/back.png";
      card.appendChild(cardImg);
      // Now initialize the card
      initializeCard(card);
      field.appendChild(card);
    } else {
      card = document.querySelector(".p2deck");
      card.style.left = "0px";
      field.appendChild(card);
    }
    var cardId = game.p2deck[0];
    setTimeout(function () {
      card.className = "p2hand";
      alignCards(2);
      game.p2hand.push(game.p2deck.splice(0, 1)[0]);
    }, 20);
  }
}

var overlay = document.querySelector(".overlay");

var okDiag = document.querySelector(".field .okdiag");
var okDiagText = document.querySelector(".field .okdiag .text");
var okDiagBtn = document.querySelector(".field .okdiag .buttons div");

var yesNoDiag = document.querySelector(".field .yesnodiag");
var yesNoDiagText = document.querySelector(".field .yesnodiag .text");
var yesNoDiagBtns = document.querySelectorAll(".field .yesnodiag .buttons div");

var discardDiag = document.querySelector(".field .discarddiag");
var discardDiagCards = document.querySelector(".field .discarddiag .cards");
var discardDiagSpan = document.querySelector(".field .discarddiag .text span");

var viewDiag = document.querySelector(".field .viewdiag");
var viewDiagCards = document.querySelectorAll(".viewdiag .cardrow .card");
var viewDiagCardsArray = [];
var viewDiagPage = 0;
var viewDiagArrows = document.querySelectorAll(".viewdiag .arrow");
var viewDiagSlider = document.querySelector(".viewdiag .scrollbar .handle");

var posDiag = document.querySelector(".field .posdiag");
var posDiagText = document.querySelector(".field .posdiag");
var posDiagCards = document.querySelectorAll(".field .posdiag .cards img");

overlay.addEventListener("mousedown", function () {
  if (this.getAttribute("data-click-hide") == "true") {
    hideViewDiag();
    hideYesNoDiag();
  }
});

for (var i = 0; i < viewDiagArrows.length; i++) {
  viewDiagArrows[i].addEventListener("mousedown", function () {
    if (viewDiagCardsArray.length > 5) {
      if (this.classList.contains("left") && viewDiagPage > 0) {
        viewDiagPage--;
      } else if (this.classList.contains("right") && viewDiagPage < viewDiagCardsArray.length - 5) {
        viewDiagPage++;
      }
      for (var i = 0; i < viewDiagCards.length; i++) {
        viewDiagCards[i].children[0].src = "img/cards/" + viewDiagCardsArray[i + viewDiagPage] + ".png";
      }
      viewDiagSlider.style.left = viewDiagPage / (viewDiagCardsArray.length - 5) * 100 + "%";
    }
  });
}

for (var i = 0; i < viewDiagCards.length; i++) {
  viewDiagCards[i].addEventListener("click", function () {
    selectDiagCard(this);
  });
  viewDiagCards[i].addEventListener("mouseover", function () {
    setCardView(this);
  });
}

function showOkDiag(text, clickHide) {
  game.reopenLastDiag = function () {
    showOkDiag("", false)
  };
  overlay.setAttribute("data-click-hide", clickHide);
  if (text.length > 0) {
    okDiagText.innerHTML = text;
  }
  okDiag.classList.remove("hide");
  overlay.classList.remove("hide");
}

function hideOkDiag() {
  okDiag.classList.add("hide");
  overlay.classList.add("hide");
}

okDiagBtn.addEventListener("click", function () {
  game.reopenLastDiag = function () {
    showOkDiag("", false);
  }
  okDiag.classList.add("hide");
  overlay.classList.add("hide");
  game.afterOkDiag();
});

function showYesNoDiag(text, clickHide) {
  game.reopenLastDiag = function () {
    showYesNoDiag("", false);
  };
  overlay.setAttribute("data-click-hide", clickHide);
  if (text.length > 0) {
    yesNoDiagText.innerHTML = text;
  }
  yesNoDiag.classList.remove("hide");
  overlay.classList.remove("hide");
}

function hideYesNoDiag() {
  yesNoDiag.classList.add("hide");
  overlay.classList.add("hide");
}

yesNoDiagBtns[0].addEventListener("click", function () {
  game.reopenLastDiag = function () {
    showYesNoDiag("", false);
  };
  game.afterYesNoDiagYes();
  hideYesNoDiag();
});

yesNoDiagBtns[1].addEventListener("click", function () {
  game.reopenLastDiag = function () {
    return 0;
  }
  game.reqTribs = 0;
  game.status = "idle"
  showTooltip(game.cardOnHover);
  hideYesNoDiag();
});

function showDiscardDiag(nofcards, clickHide) {
  discardDiagCards.innerHTML = "";
  for (var i = 0; i < nofcards; i++) {
    discardDiagCards.innerHTML += '<img src="img/cards/back.png"/>'
  }
  if (nofcards == 1) {
    discardDiagSpan.innerHTML = "1 card";
  } else {
    discardDiagSpan.innerHTML = nofcards + " cards";
  }

  game.status = "discard";

  // Bring hand cards to the top of the overlay
  var p1handCards = document.querySelectorAll(".p1hand");
  for (var i = 0; i < p1handCards.length; i++) {
    p1handCards[i].classList.add("discardState");
  }

  overlay.setAttribute("data-click-hide", clickHide);
  discardDiag.classList.remove("hide");
  overlay.classList.remove("hide");
}

function hideDiscardDiag() {
  discardDiag.classList.add("hide");
  overlay.classList.add("hide");
  var p1handCards = document.querySelectorAll(".p1hand");
  for (var i = 0; i < p1handCards.length; i++) {
    p1handCards[i].classList.remove("discardState");
  }
}

function showViewDiag(cards, clickHide) {
  // Initialize the viewDiag
  viewDiagCardsArray = cards;
  viewDiagPage = 0;
  viewDiagSlider.style.left = "0%";
  // Now append the cards
  for (var i = 0; i < 5; i++) {
    if (cards[i]) {
      viewDiagCards[i].children[0].src = "img/cards/" + cards[i] + ".png";
    } else {
      viewDiagCards[i].children[0].src = "img/cards/placeholder.png";
    }
  }
  overlay.setAttribute("data-click-hide", clickHide);
  viewDiag.classList.remove("hide");
  overlay.classList.remove("hide");
}

function hideViewDiag() {
  viewDiag.classList.add("hide");
  overlay.classList.add("hide");
}

function showPosDiag(cardId, clickHide) {
  posDiagCards[0].src = "img/cards/" + cardId + ".png";
  posDiagCards[1].src = "img/cards/" + cardId + ".png";
  overlay.setAttribute("data-click-hide", clickHide);
  posDiag.classList.remove("hide");
  overlay.classList.remove("hide");
}

function hidePosDiag() {
  posDiag.classList.add("hide");
  overlay.classList.add("hide");
}

for (var i = 0; i < 2; i++) {
  posDiagCards[i].addEventListener("click", function () {
    selectPos(this)
  });
}

function viewDiagCardClicked(card) {
  if (card.classList.contains("p1grave")) {
    showViewDiag(game.p1grave, "true");
  } else if (card.classList.contains("p2grave")) {
    showViewDiag(game.p2grave, "true");
  } else if (card.classList.contains("p1fusion")) {
    showViewDiag(game.p1fusdeck, "true");
  }
}

function discardFromHand(card) {
  if (card.classList.contains("p1hand") && card.classList.contains("discardState")) {
    var cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
    var cardIndexInHand = game.p1hand.indexOf(cardId);
    game.p1hand.splice(cardIndexInHand, 1);
    game.p1grave.push(cardId);
    card.className = "p1grave";
    alignCards(1);
    discardDiagCards.removeChild(discardDiagCards.lastElementChild);
    var cardsLeft = discardDiagCards.children.length;
    if (cardsLeft > 1) {
      discardDiagSpan.innerHTML = cardsLeft + " cards";
    } else if (cardsLeft == 1) {
      discardDiagSpan.innerHTML = "1 card";
    } else {
      hideDiscardDiag();
      game.afterDiscardDiag();
      game.status = "idle";
      showTooltip(game.cardOnHover);
    }
  }
}

function tribute(card) {
  var zone = card.className.match(/(?<=p1m)\d/);
  if (zone && game.status == "tribute") {
    var spinner = document.querySelector(".field .tribute.m" + zone);
    var cardId = game.p1mzone[zone - 1].id;
    game.selectedTribIds.push(cardId);
    spinner.classList.remove("hide");
    game.selectedTribs.push(Number(zone));
    card.classList.add("dimForTribute");
    if (game.selectedTribs.length == game.reqTribs) {
      game.status = "tributing";
      for (let i = 0; i < game.reqTribs; i++) {
        setTimeout(function () {
          var card = document.querySelector(".p1m" + game.selectedTribs[i]);
          var spinner = document.querySelector(".tribute.m" + game.selectedTribs[i]);
          spinner.classList.add("hide");
          setTimeout(function () {
            game.p1grave.push(game.selectedTribIds[0]);
            game.p1mzone[game.selectedTribs[i] - 1] = 0;
            card.className = "p1grave";
            setTimeout(function () {
              card.children[0].src = "img/cards/" + game.selectedTribIds[0] + ".png";
              game.selectedTribIds = game.selectedTribIds.slice(1);
            }, 68);
          }, 300);
        }, 1000 * i + 1000);
      }
      setTimeout(function () {
        var cardPlayed = {
          id: game.cardToTribPlay.id,
          pos: game.cardToTribPlay.pos,
          atk: Number(cards[game.cardToTribPlay.id - 1][7]),
          def: Number(cards[game.cardToTribPlay.id - 1][8]),
          turnPosSet: game.turn
        }
        var firstEmptyZone = getFirstEmptyZone(1, "m");
        game.p1mzone[firstEmptyZone - 1] = cardPlayed;
        game.p1hand.splice(game.p1hand.indexOf(game.cardToTribPlay.id), 1);
        if (cardPlayed.pos == 0) {
          game.cardToTribPlay.elem.className = `p1m${firstEmptyZone}`;
          setTimeout(function () {
            createFadeEffect(game.cardToTribPlay.elem);
            setTimeout(function () {
              game.status = "idle";
              showTooltip(game.cardOnHover);
            }, 1000);
          }, 500);
        } else if (cardPlayed.pos == 2) {
          game.cardToTribPlay.elem.className = `p1m${firstEmptyZone} mFaceDown`;
          setTimeout(function () {
            game.cardToTribPlay.elem.children[0].src = "img/cards/back.png";
          }, 68);
          setTimeout(function () {
            game.status = "idle";
            showTooltip(game.cardOnHover);
          }, 700);
        }
        alignCards(1);
      }, requiredTributes(game.cardToTribPlay.id) == 1 ? 1800 : 2800);
    }
  }
}

function shake(card) {
  var player = Number(card.className.match(/(?<=p)\d(?=m\d)/));
  var zone = Number(card.className.match(/(?<=p\dm)\d/));
  if (player == 2) {
    zone = 6 - zone;
  }
  var shakeCount = 0;
  var shakeInterval = setInterval(function () {
    if (shakeCount == 4) {
      card.setAttribute("style", "");
      clearInterval(shakeInterval);
    } else if (shakeCount & 1) {
      card.setAttribute("style", `left:calc(50% - ${110 * (1 - zone) + 300}px) !important`);
    } else {
      card.setAttribute("style", `left:calc(50% - ${110 * (1 - zone) + 340}px) !important`);
    }
    shakeCount++;
  }, 50);
}

function selectAttackingMonster(card) {
  var classListString = Array.from(card.classList).join("");
  if (game.phase == "bp" && classListString.indexOf("p1m") > -1) {
    var index = classListString.indexOf("p1m") + 3;
    var zone = Number(classListString[index]);
    game.atkmonster.id = game.p1mzone[zone - 1].id;
    game.atkmonster.zone = zone;
    game.atkmonster.atk = game.p1mzone[zone - 1].atk;
    game.atkmonster.def = game.p1mzone[zone - 1].def;
    game.status = "selAtkTarget";
  }
}

function selectAttackTarget(card) {
  var classListString = Array.from(card.classList).join("");
  if (game.status == "selAtkTarget" && classListString.indexOf("p2m") > -1) {
    var index = classListString.indexOf("p2m") + 3;
    var zone = Number(classListString[index]);
    var cardId = game.p2mzone[zone - 1].id;
    game.atktarget.id = cardId;
    game.atktarget.zone = zone;
    game.atktarget.pos = game.p2mzone[zone - 1].pos;
    game.atktarget.atk = game.p2mzone[zone - 1].atk;
    game.atktarget.def = game.p2mzone[zone - 1].def;
    game.status = "damageCalc"
    setTimeout(applyDamage, 1000);
  }
}

function applyDamage() {
  var damage = 0;
  var battleDiff = 0;
  if (game.atktarget.pos == 1 || game.atktarget.pos == 2) {
    if (game.atktarget.def > game.atkmonster.atk) {
      damage = game.atkmonster.atk - game.atktarget.def;
    }
    battleDiff = game.atkmonster.atk - game.atktarget.def;
  } else if (game.atktarget.pos == 0) {
    damage = game.atkmonster.atk - game.atktarget.atk;
    battleDiff = game.atkmonster.atk - game.atktarget.atk;
  }
  game.afterDamage = function () {
    setTimeout(function () {
      // check who is receiving the damage
      if (damage > 0) {
        var card = document.querySelector(`.p2m${game.atktarget.zone}`);
        shake(card);
        // destroy the attacked monster
        setTimeout(function () {
          field.appendChild(card);
          setTimeout(function () {
            // NOTE: card may not belong to player 2 (card ownership issue)
            game.p2mzone[game.atktarget.zone - 1] = 0;
            game.p2grave.push(game.atktarget.id);
            card.className = "p2grave";
            setTimeout(function () {
              monsterDestroyed(game.atktarget.id, "p2grave", true);
            }, 500);
          }, 20);
        }, 1150);
      } else if (damage < 0) {
        if (game.atktarget.pos == 0) {
          // check position
          var card = document.querySelector(`.p1m${game.atkmonster.zone}`);
          shake(card);
          // destroy the attacking monster
          setTimeout(function () {
            field.appendChild(card);
            setTimeout(function () {
              // NOTE: card may not belong to player 1 (card ownership issue)
              game.p1mzone[game.atkmonster.zone - 1] = 0;
              game.p1grave.push(game.atkmonster.id);
              card.className = "p1grave";
              setTimeout(function () {
                var id = game.selectedCards.cards[0];
                monsterDestroyed(game.atkmonster.id, "p1grave", true);
              }, 500);
            }, 20);
          }, 1150);
        } else {
          game.status = "idle";
          showTooltip(game.cardOnHover);
          game.afterDamage = function () {
            return 0;
          }
        }
      } else {
        if (battleDiff > 0) {
          if (game.atktarget.pos == 1 || game.atktarget.pos == 2) {
            var card = document.querySelector(`.p2m${game.atktarget.zone}`);
            shake(card);
            // destroy the attacked monster
            setTimeout(function () {
              field.appendChild(card);
              setTimeout(function () {
                // NOTE: card may not belong to player 2 (card ownership issue)
                game.p2mzone[game.atktarget.zone - 1] = 0;
                game.p2grave.push(game.atktarget.id);
                card.className = "p2grave";
                setTimeout(function () {
                  monsterDestroyed(game.atktarget.id, "p2grave", true);
                }, 500);
              }, 20);
            }, 1150);
          }
        }
      }
    }, 1000);
    game.afterDamage = function () {
      return 0;
    }
  }
  console.log(damage);

  var attackedCard = document.querySelector(".p2m" + game.atktarget.zone);
  if (damage > 0) {
    decreaseLP(2, damage);
  } else if (damage < 0) {
    if (game.atktarget.pos == 0 || game.atktarget.pos == 1) {
      if (game.atktarget.pos == 0) {
        shieldVerticalCard(attackedCard);
      } else {
        shieldHorizontalCard(attackedCard);
      }
      setTimeout(function () {
        decreaseLP(1, Math.abs(damage));
      }, 1520);
    } else if (game.atktarget.pos == 2) {
      revealFaceDownCard(attackedCard);
      game.p2mzone[game.atktarget.zone - 1].pos = 1;
      setTimeout(function () {
        shieldHorizontalCard(attackedCard);
        setTimeout(function () {
          decreaseLP(1, Math.abs(damage));
        }, 1520);
        // Wait 250ms after card is revealed
      }, 450);
    }
  } else {
    if (battleDiff > 0) {
      if (game.atktarget.pos == 1) {
        game.afterDamage();
      } else if (game.atktarget.pos == 2) {
        revealFaceDownCard(attackedCard);
        game.p2mzone[game.atktarget.zone - 1].pos = 1;
        game.afterDamage();
      }
    } else if (battleDiff == 0) {
      // Can be replaced with else as battleDiff cannot be < 0 when damage = 0
      if (game.atktarget.pos == 0 || game.atktarget.pos == 1) {
        shieldHorizontalCard(attackedCard);
        setTimeout(function () {
          game.status = "idle";
          showTooltip(game.cardOnHover);
        }, 2020);
      } else if (game.atktarget.pos == 2) {
        revealFaceDownCard(attackedCard);
        game.p2mzone[game.atktarget.zone - 1].pos = 1;
        setTimeout(function () {
          shieldHorizontalCard(attackedCard);
          setTimeout(function () {
            game.status = "idle";
            showTooltip(game.cardOnHover);
          }, 2020);
          // Wait 250ms after card is revealed
        }, 450);
      }
    } else {
      // Pending
    }
  }
}

function selectDiagCard(card) {
  if (game.status == "diagSelect") {
    var cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
    if (cardId) {
      game.selectedCards.cards.push(cardId);
      if (game.selectedCards.cards.length == game.selectedCards.count) {
        viewDiag.classList.add("hide");
        overlay.classList.add("hide");
        game.afterSelectDiagCards();
      }
    }
  }
}

function selectPos(card) {
  if (game.status == "posSelect") {
    if (card.className == "atk") {
      game.selectedPos = 0;
    } else {
      game.selectedPos = 1;
    }
    posDiag.classList.add("hide");
    overlay.classList.add("hide");
    game.afterPosDiag();
  }
}

function selectFieldCard(card) {
  var classListString = Array.from(card.classList).join(" ");
  if (game.fieldSelectCondition(card) && classListString.match(/p[1|2][m|s]\d/) && game.status == "fieldSelect") {
    var player = classListString[classListString.search(/p[1|2][m|s]\d/) + 1];
    var zoneType = classListString[classListString.search(/p[1|2][m|s]\d/) + 2];
    var zoneNum = Number(classListString[classListString.search(/p[1|2][m|s]\d/) + 3]);
    var cardId;
    if (zoneType == "m") {
      cardId = game["p" + player + "mzone"][zoneNum - 1].id;
    } else if (zoneType == "s") {
      cardId = game["p" + player + "stzone"][zoneNum - 1].id;
    }
    game.selectedCards.players.push(player);
    game.selectedCards.zones.push(zoneNum);
    game.selectedCards.types.push(zoneType);
    game.selectedCards.cards.push(cardId);
    game.selectedCards.elems.push(card);
    flashCard(card, 2);
    if (game.selectedCards.cards.length == game.selectedCards.count) {
      game.status = "cardsSelected";
      game.afterSelectFieldCards();
    }
  }
}

var cardView = document.querySelector(".pane .card img");
var cardInfo = document.querySelector(".pane .cardinfo");
var cardInfoName = document.querySelector(".pane .cardinfo .namewrapper .name");
var cardInfoAttrib = document.querySelector(".pane .cardinfo .namewrapper .attrib img");
var cardInfoType = document.querySelector(".pane .cardinfo .type");
var cardInfoLevel = document.querySelector(".pane .cardinfo .level");
var cardInfoText = document.querySelector(".pane .cardinfo .text");
var cardInfoATK = document.querySelector(".pane .cardinfo .battledata .atk");
var cardInfoDEF = document.querySelector(".pane .cardinfo .battledata .def");

var cardTooltip = document.querySelector(".field .cardtooltip");

function showTooltip(card) {
  game.cardOnHover = card;
  if (card && card.classList.contains("p1hand")) {
    var cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
    var left = Number(getComputedStyle(card).getPropertyValue("left").slice(0, -2));

    cardTooltip.style.left = left + 100 + "px";

    var availMZone = getFirstEmptyZone(1, "m") > 0;
    var availSZone = getFirstEmptyZone(1, "s") > 0;

    if (cards[cardId - 1][2] == "Spell" && availSZone) {
      if (checkActivationConditions(cardId)) {
        cardTooltip.innerHTML = "ACTIVATE";
        cardTooltip.classList.remove("hide");
      } else if (checkMagicSetConditions(cardId)) {
        cardTooltip.innerHTML = "SET";
        cardTooltip.classList.remove("hide");
      }
    } else if (cards[cardId - 1][2] == "Trap" && checkMagicSetConditions(cardId) && availSZone) {
      cardTooltip.innerHTML = "SET";
      cardTooltip.classList.remove("hide");
    } else if (!availMZone && cards[cardId - 1][6] > 4) {
      if (game.perm.p1CanSummon && checkPlayConditions(cardId)) {
        cardTooltip.innerHTML = "SUMMON";
        cardTooltip.classList.remove("hide");
      } else if (game.perm.p1CanSet && checkPlayConditions(cardId)) {
        cardTooltip.innerHTML = "SET";
        cardTooltip.classList.remove("hide");
      }
    } else if (availMZone) {
      if (game.perm.p1CanSummon && checkPlayConditions(cardId)) {
        cardTooltip.innerHTML = "SUMMON";
        cardTooltip.classList.remove("hide");
      } else if (game.perm.p1CanSet && checkPlayConditions(cardId)) {
        cardTooltip.innerHTML = "SET";
        cardTooltip.classList.remove("hide");
      }
    }
  }
}


// No need to check for number of summons available as this function
// only changes the tooltip text
function switchTooltip(card) {
  if (card.classList.contains("p1hand")) {
    var cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
    var cardType = cards[cardId - 1][2];
    var availTooltips = [];

    if (cardType == "Spell") {
      if (checkActivationConditions(cardId)) {
        availTooltips.push("ACTIVATE");
      }
      availTooltips.push("SET");
    } else if (cardType == "Trap") {
      availTooltips = ["SET"];
    } else {
      if (game.perm.p1CanSummon) {
        availTooltips.push("SUMMON");
      }
      if (game.perm.p1CanSet) {
        availTooltips.push("SET");
      }
    }

    if (availTooltips.indexOf(cardTooltip.innerHTML) < availTooltips.length - 1) {
      cardTooltip.innerHTML = availTooltips[availTooltips.indexOf(cardTooltip.innerHTML) + 1];
    } else {
      cardTooltip.innerHTML = availTooltips[0];
    }
  }
}

function hideTooltip() {
  cardTooltip.classList.add("hide");
}

var fieldTooltip = document.querySelector(".field .fieldtooltip");

function showFieldTooltip(card) {
  var classListString = Array.from(card.classList).join("");
  if (classListString.search(/p1[m|s]\d/) > -1) {
    var type = classListString[classListString.search(/p1[m|s]\d/) + 2];
    var zone = Number(classListString[classListString.search(/p1[m|s]\d/) + 3]);
    var offsetX, offsetY;
    if (type == "m") {
      if (game.turn & 1
        && game.p1mzone[zone - 1].turnPosSet < game.turn
        && (game.phase == "m1" || game.phase == "m2")
        && game.status == "idle") {
        if (game.p1mzone[zone - 1].pos == 0) {
          fieldTooltip.innerHTML = "Defense";
        } else if (game.p1mzone[zone - 1].pos == 1) {
          fieldTooltip.innerHTML = "Attack";
        } else {
          fieldTooltip.innerHTML = "Flip";
        }
        offsetX = zone * 110 - 330;
        if (offsetX < 0) {
          offsetX = "- " + Math.abs(offsetX);
        } else {
          offsetX = "+ " + offsetX;
        }
        if (classListString.indexOf("mFaceDown") > -1 || classListString.indexOf("defPos") > -1) {
          offsetY = "calc(50% - 10px)";
        } else {
          offsetY = "calc(50% - 25px)";
        }
        fieldTooltip.style.top = offsetY;
        fieldTooltip.style.left = "calc(50% " + offsetX + "px)";
        fieldTooltip.classList.remove("hide");
      }
    } else if (type == "s") {
      if (checkActivationConditions(game.p1stzone[zone - 1].id, "field") && game.p1stzone[zone - 1].pos == 2) {
        fieldTooltip.innerHTML = "Activate";
        offsetX = zone * 110 - 330;
        if (offsetX < 0) {
          offsetX = "- " + Math.abs(offsetX);
        } else {
          offsetX = "+ " + offsetX;
        }
        offsetY = "calc(50% + 95px)";
        fieldTooltip.style.top = offsetY;
        fieldTooltip.style.left = "calc(50% " + offsetX + "px)";
        fieldTooltip.classList.remove("hide");
      }
    }
  }
}

function hideFieldTooltip() {
  fieldTooltip.classList.add("hide");
}

function switchPos(card) {
  var classListString = Array.from(card.classList).join("");
  var index = classListString.indexOf("p1m") + 3;
  var zone = Number(classListString[index]);
  if (index > 2 && game.status == "idle" && (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && game.p1mzone[zone - 1].turnPosSet < game.turn) {
    if (game.p1mzone[zone - 1].pos == 0) {
      game.p1mzone[zone - 1].pos = 1;
      game.p1mzone[zone - 1].turnPosSet = game.turn;
      card.className = "p1m" + zone + " defPos";
    } else {
      game.p1mzone[zone - 1].pos = 0;
      game.p1mzone[zone - 1].turnPosSet = game.turn;
      card.className = "p1m" + zone;
      setTimeout(function () {
        card.children[0].src = "img/cards/" + game.p1mzone[zone - 1].id + ".png";
      }, 68);
    }
    fieldTooltip.classList.add("hide");
  }
}

// Reveal a face-down monster card
function revealFaceDownCard(card) {
  if (card.className.includes("mFaceDown")) {
    var player = card.className.match(/(?<=p)\d(?=m\d)/)[0];
    var zone = Number(card.className.match(/(?<=p\dm)\d/)[0]);
    var cardId = game["p" + player + "mzone"][zone - 1].id;
    console.log(player, zone, cardId);
    card.className = "p" + player + "m" + zone + " defPos";
    setTimeout(function () {
      card.children[0].src = "img/cards/" + cardId + ".png";
    }, 68);
  }
}

// Add the white shield effect that wipes over the card
// Total time: 520ms;
function shieldHorizontalCard(card) {
  var shield = document.createElement("div");
  shield.className = "h-shield";
  card.appendChild(shield);
  setTimeout(function () {
    shield.classList.add("done");
    setTimeout(function () {
      card.removeChild(shield);
    }, 500);
  }, 20);
}

function shieldVerticalCard(card) {
  var shield = document.createElement("div");
  shield.className = "v-shield";
  card.appendChild(shield);
  setTimeout(function () {
    shield.classList.add("done");
    setTimeout(function () {
      card.removeChild(shield);
    }, 500);
  }, 20);
}

function setCardView(card) {
  var classes = card.classList;
  var cardId;
  // cards in which the card image is shown
  var classesToTest = [
    "card", "p1hand", "p1grave", "p2grave",
    "p1m1", "p1m2", "p1m3", "p1m4", "p1m5",
    "p1s1", "p1s2", "p1s3", "p1s4", "p1s5",
    "p2m1", "p2m2", "p2m3", "p2m4", "p2m5"
  ];
  for (var i = 0; i < classesToTest.length; i++) {
    if (classes.contains(classesToTest[i]) && !classes.contains("mFaceDown") && !classes.contains("stFaceDown")) {
      cardId = Number(card.children[0].src.split("/").pop().split(".")[0]);
      break;
    }
  }

  classesToTest = [
    "p1m1", "p1m2", "p1m3", "p1m4", "p1m5"
  ];
  for (var i = 0; i < classesToTest.length; i++) {
    if (classes.contains(classesToTest[i]) && classes.contains("mFaceDown")) {
      cardId = game.p1mzone[Number(classesToTest[i].slice(-1)) - 1].id;
    }
  }

  classesToTest = [
    "p1s1", "p1s2", "p1s3", "p1s4", "p1s5"
  ];
  for (var i = 0; i < classesToTest.length; i++) {
    if (classes.contains(classesToTest[i]) && classes.contains("stFaceDown")) {
      cardId = game.p1stzone[Number(classesToTest[i].slice(-1)) - 1].id;
    }
  }

  if (classes.contains("p1fusion")) {
    cardId = game.p1fusdeck[0];
  }

  if (cardId) {
    cardInfo.classList.remove("back");
    cardView.src = "img/cards/" + cardId + ".png";
    if (cards[cardId - 1][2] == "Spell" || cards[cardId - 1][2] == "Trap") {
      cardInfo.classList.add("magic");
      cardInfoName.innerHTML = cards[cardId - 1][1];
      cardInfoAttrib.src = "img/attrib/" + cards[cardId - 1][2].toLowerCase() + ".png";
      cardInfoType.innerHTML = "[" + cards[cardId - 1][2] + " Card]";
      cardInfoText.innerHTML = cards[cardId - 1][9].replace(/&nbsp;/g, " ");
    } else {
      cardInfo.classList.remove("magic");
      if (cards[cardId - 1][4] == "Effect" || cards[cardId - 1][3] == "Fusion") {
        cardInfoText.classList.add("effect");
      } else {
        cardInfoText.classList.remove("effect");
      }
      cardInfoName.innerHTML = cards[cardId - 1][1];
      cardInfoAttrib.src = "img/attrib/" + cards[cardId - 1][5].toLowerCase() + ".png";
      cardInfoType.innerHTML = "[" + cards[cardId - 1][2];
      if (cards[cardId - 1][3] != "") {
        cardInfoType.innerHTML += "/" + cards[cardId - 1][3];
      }
      if (cards[cardId - 1][4] != "") {
        cardInfoType.innerHTML += "/" + cards[cardId - 1][4];
      }
      cardInfoLevel.innerHTML = "";
      for (var i = 0; i < Number(cards[cardId - 1][6]); i++) {
        cardInfoLevel.innerHTML += '<img src="img/level.png"/>';
      }
      cardInfoType.innerHTML += "]";
      cardInfoText.innerHTML = cards[cardId - 1][9];
      cardInfoATK.innerHTML = cards[cardId - 1][7];
      cardInfoDEF.innerHTML = cards[cardId - 1][8];
    }
  } else {
    cardInfo.classList.add("back");
    cardView.src = "img/cards/back.png";
  }
}

function decreaseLP(player, amount) {
  var lpdiff = document.querySelector(".wrapper.p" + player + " .info .lptext .lpdiff");
  lpdiff.classList.remove("hide");
  lpdiff.classList.remove("pos");
  lpdiff.innerHTML = "-" + amount;
  setTimeout(function () {
    var target;
    if (player == 1) {
      target = Number(p1lp.innerHTML) - amount;
      if (target < 0) {
        target = 0;
      }
      var int = setInterval(function () {
        var currLP = Number(p1lp.innerHTML);
        if (currLP - target > 10) {
          p1lp.innerHTML = currLP - 10;
          var lpbarWidth = currLP - 10 > 8000 ? 100 : (currLP - 10) / 80;
          p1lpbar.style.width = lpbarWidth + "%";
        } else {
          p1lp.innerHTML = target;
          var lpbarWidth = target > 8000 ? 100 : target / 80;
          p1lpbar.style.width = lpbarWidth + "%";
          clearInterval(int);
          game.afterDamage();
          setTimeout(function () {
            lpdiff.classList.add("hide");
          }, 0);
        }
      }, 1);
    } else if (player == 2) {
      target = Number(p2lp.innerHTML) - amount;
      if (target < 0) {
        target = 0;
      }
      var int = setInterval(function () {
        var currLP = Number(p2lp.innerHTML);
        if (currLP - target > 10) {
          p2lp.innerHTML = currLP - 10;
          var lpbarWidth = currLP - 10 > 8000 ? 100 : (currLP - 10) / 80;
          p2lpbar.style.width = lpbarWidth + "%";
        } else {
          p2lp.innerHTML = target;
          var lpbarWidth = target > 8000 ? 100 : target / 80;
          p2lpbar.style.width = lpbarWidth + "%";
          clearInterval(int);
          game.afterDamage();
          setTimeout(function () {
            lpdiff.classList.add("hide");
          }, 0);
        }
      }, 1);
    }
  }, 1000);
}

function increaseLP(player, amount) {
  var lpdiff = document.querySelector(".wrapper.p" + player + " .info .lptext .lpdiff");
  lpdiff.classList.remove("hide");
  lpdiff.classList.add("pos");
  lpdiff.innerHTML = "+" + amount;
  setTimeout(function () {
    var target;
    if (player == 1) {
      target = Number(p1lp.innerHTML) + amount;
      var int = setInterval(function () {
        var currLP = Number(p1lp.innerHTML);
        if (target - currLP > 10) {
          p1lp.innerHTML = currLP + 10;
          var lpbarWidth = currLP + 10 > 8000 ? 100 : (currLP + 10) / 80;
          p1lpbar.style.width = lpbarWidth + "%";
        } else {
          p1lp.innerHTML = target;
          var lpbarWidth = target > 8000 ? 100 : target / 80;
          p1lpbar.style.width = lpbarWidth + "%";
          clearInterval(int);
          game.afterDamage();
          setTimeout(function () {
            lpdiff.classList.add("hide");
          }, 0);
        }
      }, 1);
    } else if (player == 2) {
      target = Number(p2lp.innerHTML) + amount;
      var int = setInterval(function () {
        var currLP = Number(p2lp.innerHTML);
        if (target - currLP > 10) {
          p2lp.innerHTML = currLP + 10;
          var lpbarWidth = currLP + 10 > 8000 ? 100 : (currLP + 10) / 80;
          p2lpbar.style.width = lpbarWidth + "%";
        } else {
          p2lp.innerHTML = target;
          var lpbarWidth = target > 8000 ? 100 : target / 80;
          p2lpbar.style.width = lpbarWidth + "%";
          clearInterval(int);
          game.afterDamage();
          setTimeout(function () {
            lpdiff.classList.add("hide");
          }, 0);
        }
      }, 1);
    }
  }, 1000);
}

var phaseTimeout;
var phases = document.querySelectorAll(".phases div");
var phaseView = document.querySelector(".field .phaseview");

for (var i = 0; i < phases.length; i++) {
  phases[i].addEventListener("mousedown", function () {
    changePhaseByClick(this.getAttribute("data-value"));
  });
}

function changePhaseByClick(phase) {
  if (game.perm.p1CanChangePhaseTo.indexOf(phase) > -1) {
    changePhase(phase);
  }
}

function changePhase(phase) {
  if (phase == "bp") {
    var hasAttackingMonster = 0;
    var opponentControlsMonster = 0;
    for (var i = 0; i < 5; i++) {
      if (game.p2mzone[i] != 0) {
        opponentControlsMonster = 1;
        break;
      }
    }
    for (var i = 0; i < 5; i++) {
      if (game.p1mzone[i].pos == 0) {
        if (!(game.p1mzone[i].id == 37 && opponentControlsMonster == 0)) {
          hasAttackingMonster = 1;
          break;
        }
      }
    }
    if (!hasAttackingMonster) {
      return;
    }
  }
  clearTimeout(phaseTimeout);
  for (var i = 0; i < phases.length; i++) {
    phases[i].classList.remove("active");
  }
  for (var i = 0; i < phases.length; i++) {
    if (phases[i].getAttribute("data-value") == phase) {
      game.phase = phase;
      phases[i].classList.add("active");
      phaseView.classList.add("hide");
      phaseView.innerHTML = phases[i].getAttribute("data-text");
      setTimeout(function () {
        phaseView.classList.remove("hide");
      }, 20);
      if (phase != "dp") {
        phaseTimeout = setTimeout(function () {
          phaseView.classList.add("hide");
        }, 1000);
      }
    }
  }
  if (phase == "bp") {
    showRelevantSwords();
    game.perm.p1CanChangePhaseTo = ["m2", "ep"];
  } else {
    for (var i = 0; i < p1swords.length; i++) {
      p1swords[i].classList.add("hide");
    }
  }
  if (phase == "ep") {
    onEndPhase();
    game.perm.p1CanChangePhaseTo = [];
  }
}

function nextPlayersTurn() {
  game.turn++;
  phaseView.classList.add("hide");
  if (game.turn & 1) {
    phaseView.innerHTML = "It's your turn";
  } else {
    phaseView.innerHTML = "It's your opponent's turn";
  }
  setTimeout(function () {
    phaseView.classList.remove("hide");
  }, 10);
}

// When the phase is changed to end phase
function onEndPhase() {
  // Check if any discards are required
  if (game.turn & 1) {
    if (game.p1hand.length > 6) {
      setTimeout(function () {
        game.afterDiscardDiag = function () {
          switchToNextPlayer();
          game.afterDiscardDiag = function () {
            return 0;
          }
        };
        showDiscardDiag(game.p1hand.length - 6, "false");
      }, 1000);
      return;
    } else {
      setTimeout(function () {
        switchToNextPlayer();
      }, 1000);
    }
  } else {
    setTimeout(function () {
      switchToNextPlayer();
    }, 1000);
  }
}

function switchToNextPlayer() {
  gameTime = 1000;
  setTimeout(function () {
    nextPlayersTurn();
  }, gameTime);
  gameTime += 1500;

  setTimeout(function () {
    changePhase("dp");
  }, gameTime);
  gameTime += 700;

  setTimeout(function () {
    drawCard(game.turn % 2 == 0 ? 2 : 1);
  }, gameTime);
  gameTime += 750;

  setTimeout(function () {
    changePhase("sp");
  }, gameTime);
  gameTime += 750;

  setTimeout(function () {
    changePhase("m1");
    game.perm.p1PlayableMonsters = 1;
  }, gameTime);
  gameTime = 0;
}

var gameTime = 0;

// Play the game
// First, draw the cards for players 1 and 2
for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    drawCard(1);
  }, 350 * i + 1000);
  setTimeout(function () {
    drawCard(2);
  }, 350 * i + 2750);
}
gameTime += 4500;

setTimeout(function () {
  changePhase("dp");
}, gameTime);
gameTime += 700;

setTimeout(function () {
  drawCard(1);
}, gameTime);
gameTime += 750;

setTimeout(function () {
  changePhase("sp");
}, gameTime);
gameTime += 750;

setTimeout(function () {
  changePhase("m1");
  game.perm.p1PlayableMonsters = 1;
}, gameTime);
gameTime += 1000;

setTimeout(function () {
  game.perm.p1CanSummon = 1;
  game.perm.p1CanSet = 1;
  game.perm.p1CanChangePhaseTo = ["ep", "bp"];
  game.status = "idle";
  showTooltip(game.cardOnHover);
}, gameTime);
gameTime = 0;

// Miscellaneous functions
function shuffle(arr) {
  var oldArr = arr;
  var newArr = [];
  for (var i = 0; oldArr.length > 0; i++) {
    var index = Math.floor(Math.random() * oldArr.length);
    newArr.push(oldArr[index]);
    oldArr = [...oldArr.slice(0, index), ...oldArr.slice(index + 1)];
  }
  return newArr;
}

// Flash a card n times
function flashCard(card, n) {
  var blinkCount = 0;
  card.style.transition = "top ease-out 0.2s";
  var x = setInterval(function () {
    card.classList.toggle("flash");
    blinkCount++;
    if (blinkCount == n * 2) {
      clearInterval(x);
      card.style.transition = "";
    }
  }, 100);
}

// Bring a card in the graveyard to the top
function bringToTop(card) {
  if (card.className.includes("p1grave")) {
    var p1gravecards = document.querySelectorAll(".p1grave");
    if (card == p1gravecards[p1gravecards.length - 1]) {
      return 0;
    }
    card.setAttribute("style", "left:calc(50% + 180px) !important");
    setTimeout(function () {
      field.appendChild(card);
      setTimeout(function () {
        card.setAttribute("style", "");
      }, 100);
    }, 200);
    return 1;
  } else if (card.className.includes("p2grave")) {
    var p2gravecards = document.querySelectorAll(".p2grave");
    if (card == p2gravecards[p2gravecards.length - 1]) {
      return 0;
    }
    card.setAttribute("style", "left:calc(50% - 380px) !important");
    setTimeout(function () {
      field.appendChild(card);
      setTimeout(function () {
        card.setAttribute("style", "");
      }, 100);
    }, 200);
    return 1;
  }
}

function toggleViewDiag() {
  showViewDiag(game.p2hand, "true");
}

// Effect activation when monster is destroyed
// id: card ID
// to: "p1grave", "p2grave"
// byBattle: true, false
function monsterDestroyed(id, to, byBattle) {
  switch (id) {
    case 27: // Nimble Momonga
      // Check if card is 1. sent to the graveyard 2. by battle
      if (to.slice(2) == "grave" && byBattle) {
        // Get the first "Nimble Momonga" in the graveyard as a node
        var card = Array.from(document.querySelectorAll("." + to)).filter((card) => {
          return card.children[0].src.split("/").pop().split(".")[0] == 27;
        }).pop();
        console.log(card, to);
        // The player to whose graveyard the monster was sent
        var player = to[1];
        // Bring the card to the top and check if it is already on top
        var atBottom = bringToTop(card);
        setTimeout(function () {
          // Glow on effect activation
          card.classList.add("glow");
          setTimeout(function () {
            card.classList.remove("glow");
            setTimeout(function () {
              game.afterDamage = function () {
                setTimeout(function () {
                  game.afterOkDiag = function () {
                    game.reopenLastDiag = function () {
                      return 0;
                    };
                    game.status = "idle";
                    showTooltip(game.cardOnHover);
                  };
                  showOkDiag("There are no cards to be added from your deck", false);
                }, 500);
                game.afterDamage = function () {
                  return 0;
                };
              };
              increaseLP(player, 1000);
            }, 900);
          }, 300);
        }, atBottom * 500 + 300);
        // MISSING: ask for special summoning more "Nimble Momonga"s
      }
      break;

    case 30: // Sangan
      if (to.slice(2) == "grave") {
        var card = Array.from(document.querySelectorAll(".p1grave")).filter((card) => {
          return card.children[0].src.split("/").pop().split(".")[0] == 30;
        })[0];
        var atBottom = bringToTop(card);
        setTimeout(function () {
          card.classList.add("glow");
          setTimeout(function () {
            card.classList.remove("glow");
            setTimeout(function () {
              var deckMonsters = game.p1deck.filter((id) => {
                return (cards[id - 1][7] <= 1500);
              });
              if (deckMonsters.length > 0) {
                var player = Number(to[1]);
                setTimeout(function () {
                  game.afterOkDiag = function () {
                    game.reopenLastDiag = function () {
                      return 0;
                    };
                    setTimeout(function () {
                      game.selectedCards.count = 1;
                      game.selectedCards.cards = [];
                      game.selectedCards.elems = [];
                      game.status = "diagSelect";
                      showViewDiag(deckMonsters, "false");
                    }, 500);
                  };

                  game.afterSelectDiagCards = function () {
                    setTimeout(function () {
                      var cardId = game.selectedCards.cards[0];
                      var cardIndex = game.p1deck.indexOf(cardId);
                      game.p1deck.splice(cardIndex, 1);
                      game.p1deck = [cardId, ...game.p1deck];
                      drawCard(1);
                      setTimeout(function () {
                        var card = document.querySelectorAll(".p1hand");
                        card = card[card.length - 1];
                        flashCard(card, 5);
                        setTimeout(function () {
                          shuffleHand(1);
                          setTimeout(function () {
                            game.status = "idle";
                            showTooltip(game.cardOnHover);
                          }, 1900);
                        }, 1500);
                      }, 200);
                    }, 500);
                  };
                  showOkDiag("Select one monster you wish to add to your hand.")
                }, 500);
              } else {
                setTimeout(function () {
                  game.afterOkDiag = function () {
                    game.reopenLastDiag = function () {
                      return 0;
                    };
                    game.status = "idle";
                    showTooltip(game.cardOnHover);
                  };
                  showOkDiag("There are no cards to be added from your deck", false);
                }, 500);
              }
            }, 400);
          }, 300);
        }, atBottom * 500 + 200);
      }
      break;

    case 36: // Witch of the black forest
      if (to.slice(2) == "grave") {
        var card = Array.from(document.querySelectorAll(".p1grave")).filter((card) => {
          return card.children[0].src.split("/").pop().split(".")[0] == 36;
        })[0];
        var atBottom = bringToTop(card);
        setTimeout(function () {
          card.classList.add("glow");
          setTimeout(function () {
            card.classList.remove("glow");
            setTimeout(function () {
              var deckMonsters = game.p1deck.filter((id) => {
                return (cards[id - 1][8] <= 1500);
              });
              if (deckMonsters.length > 0) {
                var player = Number(to[1]);
                setTimeout(function () {
                  game.afterOkDiag = function () {
                    game.reopenLastDiag = function () {
                      return 0;
                    };
                    setTimeout(function () {
                      game.selectedCards.count = 1;
                      game.selectedCards.cards = [];
                      game.selectedCards.elems = [];
                      game.status = "diagSelect";
                      showViewDiag(deckMonsters, "false");
                    }, 500);
                  };

                  game.afterSelectDiagCards = function () {
                    setTimeout(function () {
                      var cardId = game.selectedCards.cards[0];
                      var cardIndex = game.p1deck.indexOf(cardId);
                      game.p1deck.splice(cardIndex, 1);
                      game.p1deck = [cardId, ...game.p1deck];
                      drawCard(1);
                      setTimeout(function () {
                        var card = document.querySelectorAll(".p1hand");
                        card = card[card.length - 1];
                        flashCard(card, 5);
                        setTimeout(function () {
                          shuffleHand(1);
                          setTimeout(function () {
                            game.status = "idle";
                            showTooltip(game.cardOnHover);
                          }, 1900);
                        }, 1500);
                      }, 200);
                    }, 500);
                  };
                  showOkDiag("Select one monster you wish to add to your hand.")
                }, 500);
              } else {
                game.afterOkDiag = function () {
                  game.reopenLastDiag = function () {
                    return 0;
                  };
                  game.status = "idle";
                  showTooltip(game.cardOnHover);
                };
                showOkDiag("There are no cards to be added from your deck", false);
              }
            }, 400);
          }, 300);
        }, atBottom * 500 + 200);
      }
      break;

    default:
      game.status = "idle";
      showTooltip(game.cardOnHover);
  }
}

// --------------- Activation conditions for spell cards ---------------
function checkActivationConditions(cardId, activateFrom) {
  var spellCards = [8, 10, 15, 17, 19, 24, 26, 29, 35];
  var condition;
  switch (cardId) {
    case 8: // Card of Safe Return
      condition = (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && game.status == "idle";
      break;

    case 10: // Change of Heart
      var x = game.p2mzone.some((item) => {
        return item != 0;
      });
      condition = x && (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && getFirstEmptyZone(1, "m") > 0 && game.status == "idle";
      break;

    case 15: // Giant Trunade
      var magicCards = [...game.p1stzone, ...game.p2stzone].filter((card) => {
        return (card != 0);
      }).map((card) => {
        return card.id;
      });
      if (activateFrom == "field") {
        if (magicCards.indexOf(15) > -1) {
          magicCards.splice(magicCards.indexOf(15), 1)
        }
      }
      condition = magicCards.length > 0 && (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && game.status == "idle";
      break;

    case 17: // Graceful Dice
      var x = game.p1mzone.some((item) => {
        return (item.pos == 0 || item.pos == 1);
      });
      condition = x && (game.phase != "dp" || game.phase != "sp") && game.status == "idle";
      break;

    case 19: // Harpie's Feather Duster
      var x = game.p2stzone.some((item) => {
        return item != 0;
      });
      condition = x && (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && game.status == "idle";
      break;

    case 24: // Monster Reborn
      var x = 0;
      var x = [...game.p1grave, ...game.p2grave].some((item) => {
        return (cards[item - 1][2] != "Spell" && cards[item - 1][2] != "Trap");
      });
      condition = x && (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && game.status == "idle";
      break;

    case 26: // Mystical Space Typhoon
      var magicCards = [...game.p1stzone, ...game.p2stzone].filter((card) => {
        return (card != 0);
      });
      magicCards = magicCards.map((card) => {
        return card.id;
      });
      if (activateFrom == "field") {
        if (magicCards.indexOf(26) > -1) {
          magicCards.splice(magicCards.indexOf(26), 1);
        }
      }
      condition = magicCards.length > 0 && (game.phase != "dp" || game.phase != "sp") && game.status == "idle";
      break;

    case 29: // Polymerisation
      var fusionMaterials = game.p1mzone.map((card) => {
        return card.id;
      }).filter((card) => {
        return card != undefined;
      }).concat(game.p1hand);
      condition = (game.phase == "m1" || game.phase == "m2")
        && fusionMaterials.indexOf(1) > -1
        && fusionMaterials.indexOf(4) > -1
        && game.p1fusdeck.indexOf(2) > -1
        && game.turn & 1
        && game.status == "idle";
      break;

    case 35: // Tribute to the Doomed
      var x = [...game.p1mzone, ...game.p2mzone].some(item => {
        return item != 0;
      });
      condition = x && (game.phase == "m1" || game.phase == "m2") && game.turn & 1 && game.status == "idle";
      break;
  }
  return condition;
}

// --------------- Activation conditions for trap cards ---------------
function checkTrapActivationConditions(id) {
  /* Events for trap card activation:
     - monster summoned/flip summoned/special summoned
     - spell card activated
     - trap card activated
     - monster sent to the graveyard
     - end phase reached
     - attack declared
  */
  var trapCards = [5, 7, 9, 22, 23, 34];
  switch (id) {
    case 5: // Backup Soldier
      var graveMonsters = game.p1grave.filter((id) => {
        return (cards[id - 1][2] != "Spell" && cards[id - 1][2] != "Trap");
      });
      var requiredMonstersAvailable = graveMonsters.some((id) => {
        return (cards[id - 1][3] != "Effect" && Number(cards[item - 1][7]) < 1500);
      });
      return (graveMonsters.length > 5 && requiredMonstersAvailable);
      break;

    case 7: // Call of the Haunted
      var graveMonsters = game.p1grave.some((id) => {
        return (cards[id - 1][2] != "Spell" && cards[id - 1][2] != "Trap");
      });
      return graveMonsters;
      break;

    case 9: // Chain Destruction
      return (Number(cards[game.playedMonster.id - 1][7]) <= 2000);
      break;

    case 22: // Magic Cylinder
      return (game.atkmonster.zone > 0);
      break;

    case 23: // Magic Jammer
      return (game.activatedCard.id > 0);
      break;

    case 34: // Torrential Tribute
      return (game.playedMonster.id > 0);
      break;
  }
}

function checkMagicSetConditions() {
  if (game.turn & 1
    && (game.phase == "m1" || game.phase == "m2")
    && game.status == "idle") {
    return 1;
  } else {
    return 0;
  }
}

function checkPlayConditions(cardId) {
  var condition = 0;
  if (game.turn & 1
    && (game.phase == "m1" || game.phase == "m2")
    && game.perm.p1PlayableMonsters > 0
    && game.status == "idle") {
    var fieldMonstersCount = 0;
    for (var i = 0; i < 5; i++) {
      if (game.p1mzone[i] != 0) {
        fieldMonstersCount++;
      }
    }
  }
  if (requiredTributes(cardId) <= fieldMonstersCount) {
    condition = 1;
  }
  return condition;
}

function requiredTributes(cardId) {
  var cardLevel = cards[cardId - 1][6];
  if (cardLevel <= 4) {
    return 0;
  } else if (cardLevel > 4 && cardLevel <= 6) {
    return 1;
  } else if (cardLevel > 6) {
    return 2;
  }
}

// show swords for all monsters that can attack
// currently only works for player 1
var p1swords = document.querySelectorAll(".sword.p1");
function showRelevantSwords() {
  var swordsArr = [];
  var opponentControlsMonster = 0;
  for (var i = 0; i < 5; i++) {
    if (game.p2mzone[i] != 0) {
      opponentControlsMonster = 1;
      break;
    }
  }
  for (var i = 0; i < 5; i++) {
    if (game.p1mzone[i].pos == 0) {
      // Check whether the card is "Zombyra the Dark" and opponent has no monsters
      if (game.p1mzone[i].id == 37 && opponentControlsMonster == 0) {
        swordsArr.push(0);
      } else {
        swordsArr.push(1);
      }
    } else {
      swordsArr.push(0);
    }
  }
  game.p1swords = swordsArr;

  // Now show the relevant swords;
  for (var i = 0; i < 5; i++) {
    if (swordsArr[i] == 1) {
      p1swords[i].classList.remove("hide");
    } else {
      p1swords[i].classList.add("hide");
    }
  }
}

function getSwordTransforms(from, to) {
  var offset, angle;
  if (to == "lp") {
    offset = 35 - Math.sqrt(Math.pow((3 - from) * 110, 2) + Math.pow(320, 2));
    angle = Math.atan((3 - from) * 110 / 320) * 180 / Math.PI;
  } else {
    offset = 35 - Math.sqrt(Math.pow((6 - to - from) * 110, 2) + Math.pow(130, 2));
    angle = Math.atan((6 - to - from) * 110 / 130) * 180 / Math.PI;
  }
  return {
    offset: offset,
    angle: angle
  };
}

function strikeWithSword(sword, from, to) {
  sword.classList.remove("active");
  sword.classList.add("moving");
  sword.style.transform = "rotate(" + getSwordTransforms(from, to).angle + "deg)";
  setTimeout(function () {
    sword.style.transform = "rotate(" + getSwordTransforms(from, to).angle + "deg) translateY(" + getSwordTransforms(from, to).offset + "px)";
    setTimeout(function () {
      sword.classList.add("hide");
      setTimeout(function () {
        sword.classList.remove("moving");
        sword.style = "";
      }, 200);
    }, 200);
  }, 300);
}

function selectSword(card) {
  if (card.className.search(/p1m\d/) > -1
    && game.phase == "bp"
    && game.turn & 1
    && (game.status == "idle" || game.status == "selAtkTarget")) {
    var swordIndex = Number(card.className[card.className.search(/p1m\d/) + 3]);
    // Check if the current mosnter has a sword
    if (game.p1swords[swordIndex - 1] == 1) {
      // Check if the opponent has monsters, otherwise attack directly
      var opponentMonsters = game.p2mzone.filter((card) => {
        return (card != 0);
      });
      if (opponentMonsters.length == 0) {
        // remove the sword
        game.p1swords[swordIndex - 1] = 0;
        selectAttackingMonster(card);
        // set the position of the card to avoid it switching position
        game.p1mzone[game.atkmonster.zone - 1].turnPosSet = game.turn;
        strikeWithSword(p1swords[swordIndex - 1], swordIndex, "lp");
        // inflict damage
        game.status = "damageCalc";
        game.afterDamage = function () {
          setTimeout(function () {
            game.status = "idle";
            showTooltip(game.cardOnHover);
          }, 500);
          game.afterDamage = function () {
            return 0;
          };
        };
        setTimeout(function () {
          var damage = game.atkmonster.atk;
          decreaseLP(2, damage);
        }, 2200);
      } else {
        if (swordIndex == game.p1CurrentSword) {
          game.p1CurrentSword = 0;
          p1swords[swordIndex - 1].classList.remove("active");
          p1swords[swordIndex - 1].style.transform = "";
          game.status = "idle";
          // Redundant
          showTooltip(game.cardOnHover);
        } else {
          game.p1CurrentSword = swordIndex;
          for (var i = 0; i < 5; i++) {
            p1swords[i].classList.remove("active");
            p1swords[i].style.transform = "";
          }
          p1swords[swordIndex - 1].classList.add("active");
          selectAttackingMonster(card);
        }
      }
    }
  }
}

function selectSwordTarget(card) {
  if (card.className.search(/p2m\d/) > -1 && game.phase == "bp" && game.turn & 1 && game.p1CurrentSword > 0) {
    var zone = Number(card.className[card.className.search(/p2m\d/) + 3]);
    strikeWithSword(p1swords[game.p1CurrentSword - 1], game.p1CurrentSword, zone);
    // remove the sword
    game.p1swords[game.p1CurrentSword - 1] = 0;
    game.p1mzone[game.atkmonster.zone - 1].turnPosSet = game.turn;
    setTimeout(function () {
      selectAttackTarget(card);
    }, 1200);
    game.p1CurrentSword = 0;
  }
}

function createFadeEffect(card) {
  var newCard = card.cloneNode(true);
  field.appendChild(newCard);
  setTimeout(function () {
    newCard.classList.add("fadeout")
    setTimeout(function () {
      field.removeChild(newCard);
    }, 500);
  }, 20);
}

function activateSpellCard(id) {
  switch (id) {
    case 8: // Card of Safe Return
      // Nothing to do
      setTimeout(function () {
        game.status = "idle";
        showTooltip(game.cardOnHover);
      }, 1000);
      break;

    case 10: // Change of Heart
      game.fieldSelectCondition = function (card) {
        var classListString = Array.from(card.classList).join(" ");
        if (classListString.search(/p2m\d/) > -1) {
          return 1;
        } else {
          return 0;
        }
      };
      game.afterOkDiag = function () {
        game.selectedCards.initialize();
        game.selectedCards.count = 1;
        game.status = "fieldSelect";
      };
      game.afterSelectFieldCards = function () {
        game.reopenLastDiag = function () {
          return 0;
        };
        setTimeout(function () {
          var firstEmptyZone = getFirstEmptyZone(1, "m");
          game.p1mzone[firstEmptyZone - 1] = game.p2mzone[game.selectedCards.zones[0] - 1];
          game.p2mzone[game.selectedCards.zones[0] - 1] = 0;
          var newClassName = game.selectedCards.elems[0].className.replace(/p2m\d/, "p1m" + firstEmptyZone);
          game.selectedCards.elems[0].className = newClassName;
          setTimeout(function () {
            game.p1stzone[game.activatedCard.zone - 1] = 0;
            game.p1grave.push(game.activatedCard.id);
            game.activatedCard.elem.className = "p1grave";
            setTimeout(function () {
              game.status = "idle";
              showTooltip(game.cardOnHover);
            }, 200);
          }, 500);
        }, 1000)
      };
      showOkDiag("Select the opponent's monster you wish to take control of", "false");
      break;

    case 15: // Giant Trunade
      var x = setInterval(function () {
        var p1CardsToReturn = document.querySelectorAll(".p1s1, .p1s2, .p1s3, .p1s4, .p1s5");
        p1CardsToReturn = Array.from(p1CardsToReturn).filter((card) => {
          return !card.classList.contains("p1s" + game.activatedCard.zone);
        });
        var p2CardsToReturn = document.querySelectorAll(".p2s1, .p2s2, .p2s3, .p2s4, .p2s5");
        if (p1CardsToReturn.length > 0) {
          var classListString = Array.from(p1CardsToReturn[0].classList).join(" ");
          var zone = Number(classListString[classListString.search(/p1s\d/) + 3]);
          field.appendChild(p1CardsToReturn[0]);
          setTimeout(function () {
            const cardId = game.p1stzone[zone - 1].id;
            game.p1hand.push(cardId);
            game.p1stzone[zone - 1] = 0;
            p1CardsToReturn[0].className = "p1hand";
            alignCards(1);
            setTimeout(function () {
              p1CardsToReturn[0].children[0].src = "img/cards/" + cardId + ".png";
            }, 68);
          }, 20);
        } else if (p2CardsToReturn.length > 0) {
          var classListString = Array.from(p2CardsToReturn[0].classList).join(" ");
          var zone = Number(classListString[classListString.search(/p2s\d/) + 3]);
          field.insertBefore(p2CardsToReturn[0], document.querySelector(".p2hand"));
          setTimeout(function () {
            const cardId = game.p2stzone[zone - 1].id;
            game.p2hand.push(cardId);
            game.p2stzone[zone - 1] = 0;
            p2CardsToReturn[0].className = "p2hand";
            alignCards(2);
            setTimeout(function () {
              p2CardsToReturn[0].children[0].src = "img/cards/back.png";
            }, 68);
          }, 20);
        } else {
          shuffleHand(1);
          setTimeout(function () {
            shuffleHand(2);
          }, 1900);
          setTimeout(function () {
            game.p1stzone[game.activatedCard.zone - 1] = 0;
            game.p1grave.push(game.activatedCard.id);
            field.appendChild(game.activatedCard.elem);
            setTimeout(function () {
              game.activatedCard.elem.className = "p1grave";
            }, 20);
            setTimeout(function () {
              game.status = "idle";
              showTooltip(game.cardOnHover);
            }, 200);
          }, 3800);
          clearInterval(x);
        }
      }, 400);
      break;

    case 17: // Graceful Dice
      var diceNum = Math.floor(Math.random() * 6) + 1;
      for (var i = 0; i < 5; i++) {
        if (game.p1mzone[i] != 0) {
          game.p1mzone[i].atk += diceNum * 100;
          game.p1mzone[i].def += diceNum * 100;
        }
      }
      break;

    case 19: // Harpie's Feather Duster
      var x = setInterval(function () {
        var cardsToDestroy = document.querySelectorAll(".p2s1, .p2s2, .p2s3, .p2s4, .p2s5");
        if (cardsToDestroy.length > 0) {
          var classListString = Array.from(cardsToDestroy[0].classList).join(" ");
          var zone = Number(classListString[classListString.search(/p[1|2]s\d/) + 3]);
          field.appendChild(cardsToDestroy[0])
          setTimeout(function () {
            cardsToDestroy[0].className = "p2grave";
            setTimeout(function () {
              cardsToDestroy[0].children[0].src = "img/cards/" + game.p2stzone[zone - 1].id + ".png";
            }, 68);
          }, 20);
        } else {
          clearInterval(x);
          setTimeout(function () {
            game.p1stzone[game.activatedCard.zone - 1] = 0;
            game.p1grave.push(game.activatedCard.id);
            game.activatedCard.elem.className = "p1grave";
          }, 700);
          setTimeout(function () {
            game.status = "idle";
            showTooltip(game.cardOnHover);
          }, 900);
        }
      }, 400);
      break;

    case 24: // Monster Reborn
      game.afterOkDiag = function () {
        game.reopenLastDiag = function () {
          return 0;
        };
        setTimeout(function () {
          var p1GraveMonsters = game.p1grave.filter((id) => {
            return (cards[id - 1][2] != "Spell" && cards[id - 1][2] != "Trap");
          });
          var p2GraveMonsters = game.p2grave.filter((id) => {
            return (cards[id - 1][2] != "Spell" && cards[id - 1][2] != "Trap");
          });
          game.selectedCards.count = 1;
          game.selectedCards.cards = [];
          game.status = "diagSelect";
          showViewDiag([...p1GraveMonsters, ...p2GraveMonsters], "false");
        }, 500);
      };
      game.afterSelectDiagCards = function () {
        setTimeout(function () {
          game.status = "posSelect";
          showPosDiag(game.selectedCards.cards[0], "false");
        }, 1000);
      }
      game.afterPosDiag = function () {
        setTimeout(function () {
          var p1GraveCards = document.querySelectorAll(".p1grave");
          var p1GraveCardIds = Array.from(p1GraveCards).map((card) => {
            return Number(card.children[0].src.split("/").pop().split(".")[0]);
          });
          var cardIndex = p1GraveCardIds.indexOf(game.selectedCards.cards[0]);
          var firstEmptyZone = getFirstEmptyZone(1, "m");
          var atBottom = bringToTop(p1GraveCards[cardIndex]);
          setTimeout(function () {
            var cardId = game.selectedCards.cards[0];
            game.p1mzone[firstEmptyZone - 1] = {
              id: cardId,
              pos: game.selectedPos,
              atk: cards[cardId - 1][7],
              def: cards[cardId - 1][8],
              turnPosSet: game.turn
            }
            game.p1grave.splice(game.p1grave.indexOf(cardId), 1);
            p1GraveCards[cardIndex].className = "p1m" + firstEmptyZone + (game.selectedPos ? " defPos" : "");
            setTimeout(function () {
              game.p1stzone[game.activatedCard.zone - 1] = 0;
              game.p1grave.push(game.activatedCard.id);
              field.appendChild(game.activatedCard.elem);
              setTimeout(function () {
                game.activatedCard.elem.className = "p1grave";
              }, 20);
              setTimeout(function () {
                game.status = "idle";
                showTooltip(game.cardOnHover);
              }, 200);
            }, 700);
          }, 700 + atBottom * 500);
        }, 500);
      };
      showOkDiag("Select one monster to special summon.", "false");
      break;

    case 26: // Mystical Space Typhoon
      game.afterOkDiag = function () {
        game.fieldSelectCondition = function (card) {
          var classListString = Array.from(card.classList).join(" ");
          if (classListString.search(/p[1|2]s\d/) > -1) {
            var zone = Number(classListString[classListString.search(/p[1|2]s\d/) + 3]);
            if (zone != game.activatedCard.zone) {
              return 1;
            } else {
              return 0;
            }
          } else {
            return 0;
          }
        }
        game.selectedCards.initialize();
        game.selectedCards.count = 1;
        game.status = "fieldSelect";
      };
      game.afterSelectFieldCards = function () {
        game.reopenLastDiag = function () {
          return 0;
        };
        setTimeout(function () {
          game["p" + game.selectedCards.players[0] + "stzone"][game.selectedCards.zones[0] - 1] = 0;
          game["p" + game.selectedCards.players[0] + "grave"].push(game.selectedCards.cards[0]);
          field.appendChild(game.selectedCards.elems[0]);
          setTimeout(function () {
            game.selectedCards.elems[0].className = "p" + game.selectedCards.players[0] + "grave";
            setTimeout(function () {
              game.selectedCards.elems[0].children[0].src = "img/cards/" + game.selectedCards.cards[0] + ".png";
            }, 68);
          }, 20);
          setTimeout(function () {
            game.p1stzone[game.activatedCard.zone - 1] = 0;
            game.p1grave.push(game.activatedCard.id);
            field.appendChild(game.activatedCard.elem);
            setTimeout(function () {
              game.activatedCard.elem.className = "p1grave";
            }, 20);
          }, 700);
          setTimeout(function () {
            game.status = "idle";
            showTooltip(game.cardOnHover);
          }, 900);
        }, 1000);
      };
      showOkDiag("Select one spell or trap card to destroy.", "false");
      break;

    case 29: // Polymerisation
      // Works only with Alligator's Sword Dragon
      game.afterOkDiag = function () {
        game.reopenLastDiag = function () {
          return 0;
        };
        setTimeout(function () {
          game.selectedCards.initialize();
          game.selectedCards.count = 1;
          game.status = "diagSelect";
          showViewDiag(game.p1fusdeck, "false");
        }, 500);
      }
      showOkDiag("Select one fusion monster to fusion summon.", "false");
      break;

    case 35: // Tribute to the Doomed
      game.afterOkDiag = function () {
        game.fieldSelectCondition = function (card) {
          var classListString = Array.from(card.classList).join(" ");
          if (classListString.search(/p[1|2]m\d/) > -1) {
            return 1;
          } else {
            return 0;
          }
        }
        game.selectedCards.initialize();
        game.selectedCards.count = 1;
        game.status = "fieldSelect";
      };
      game.afterSelectFieldCards = function () {
        game.reopenLastDiag = function () {
          return 0;
        };
        game["p" + game.selectedCards.players[0] + "mzone"][game.selectedCards.zones[0] - 1] = 0;
        game["p" + game.selectedCards.players[0] + "grave"].push(game.selectedCards.cards[0]);
        setTimeout(function () {
          field.appendChild(game.selectedCards.elems[0]);
          setTimeout(function () {
            game.selectedCards.elems[0].className = "p" + game.selectedCards.players[0] + "grave";
            setTimeout(function () {
              game.selectedCards.elems[0].children[0].src = "img/cards/" + game.selectedCards.cards[0] + ".png";
            }, 68);
          }, 20);
          setTimeout(function () {
            game.p1stzone[game.activatedCard.zone - 1] = 0;
            game.p1grave.push(game.activatedCard.id);
            field.appendChild(game.activatedCard.elem);
            setTimeout(function () {
              game.activatedCard.elem.className = "p1grave";
            }, 20);
            setTimeout(function () {
              // The graveyard to which the card was sent
              var grave = "p" + game.selectedCards.players[0] + "grave";
              setTimeout(function () {
                var id = game.selectedCards.cards[0];
                monsterDestroyed(id, grave, false);
              }, 500);
            }, 200);
          }, 700);
        }, 1000);
      };
      game.afterDiscardDiag = function () {
        setTimeout(function () {
          showOkDiag("Select one monster to destroy.", "false");
          game.afterDiscardDiag = function () {
            return 0;
          };
        }, 500);
      };
      showDiscardDiag(1, "false");
      break;
  }
}

// Rotate selected sword when the mouse moves
window.addEventListener("mousemove", function (event) {
  if (game.phase == "bp" && game.status == "selAtkTarget" && game.p1CurrentSword > 0) {
    var swordZone = game.p1CurrentSword;
    var sword = document.querySelector(".sword.p1.s" + swordZone);
    var fieldXOffset = field.getBoundingClientRect().x;
    var coords = {
      x: (window.innerWidth + fieldXOffset) / 2 + swordZone * 110 - 330,
      y: window.innerHeight / 2 + 65
    }
    var angle = Math.atan((event.clientX - coords.x) / (coords.y - event.clientY)) * 180 / Math.PI;
    if (coords.y < event.clientY) {
      angle += 180;
    }
    sword.style.transform = `rotate(${angle}deg)`;
  }
});