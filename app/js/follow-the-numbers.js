var XMing = XMing || {};

XMing.GameStateManager = new function() {
    var windowWidth = 0;
    var gameState;
    var gameTimer;
    var remainingTime;
    var score = 0;

    var arabicNumerals = _.each(_.range(1, 17), function(number) {
        return number + "";
    });
    var romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"];
    var numerals = arabicNumerals;
    var selectedNumeralType = "arabic";

    var roundNumber = 0;
    var selectedNumbers = [];

    var injectedStyleDiv;

    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    this.setupGrid = function() {

        selectedNumbers = [];

        var numbers = _.first(numerals, roundNumber);
        numbers = _.shuffle(
            numbers.concat(
                _.times(16 - roundNumber, function() {
                    return "";
                })
            )
        );

        $(".game-grid").html("");
        _.each(numbers, function(number) {
            $(".game-grid").append("<li><div class='content'>" + number + "</li>");
        });

        $(".game-grid").addClass("animated fadeIn");
        $(".game-grid.animated.fadeIn").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(".game-grid.animated.fadeIn").removeClass("animated fadeIn");
        });
    };
    this.setupGameNode = function() {
        var self = this;

        roundNumber++;

        this.setupGrid();

        remainingTime = roundNumber + 3.5;
        $("#timer-value").html(Math.floor(remainingTime));

        (function countdown() {
            remainingTime -= 0.5;
            $("#timer-value").html(Math.ceil(remainingTime));
            $("#timer-value").addClass("animated fadeIn");
            $("#score-value").html(score);

            if (remainingTime <= 0) {
                clearTimeout(gameTimer);

                $("#result-content")
                    .html("Time's up!")
                    .addClass('animated bounceIn')
                    .css("color", "rgba(17, 189, 255, 255)");
                $("#timer-value").removeClass("animated fadeIn");

                self.setupNextRound();
            } else {
                gameTimer = setTimeout(countdown, 500);
            }
        })();

        $("ul.game-grid li").click(function() {

            if (!$(this).hasClass("selected")) {
                var selectedNumber = $(this.firstChild).html();
                if (selectedNumber == numerals[selectedNumbers.length]) {
                    $(this).addClass("selected");
                    selectedNumbers.push(selectedNumber);
                    self.checkResult();
                } else {
                    if (selectedNumber != "") {
                        var $thisFirstChild = $(this.firstChild);
                        $thisFirstChild.addClass("animated shake");
                        $thisFirstChild.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                            $thisFirstChild.removeClass("animated shake");
                        });
                    }
                }
            }
        });
    };
    this.setupNextRound = function() {
        var self = this;

        var gameGrid = $("ul.game-grid");
        $("#result")
            .width(gameGrid.width())
            .height(gameGrid.height())
            .show();

        _.delay(function() {
            $("#result").hide();

            if (roundNumber < numerals.length) {
                self.setupGameNode();
            } else {
                self.endGame();
            }
        }, 1000);
    };
    this.checkResult = function() {
        if (selectedNumbers.length == roundNumber) {
            $("#result-content")
                .html("Correct!")
                .addClass('animated bounceIn')
                .css("color", "rgba(0, 255, 0, 255)");

            score += remainingTime * 10;
            $(".score-change")
                .html("+" + remainingTime * 10)
                .css("color", "rgba(0, 255, 0, 255)");

            $("#timer-value").removeClass("animated fadeIn");
            $("#score-value").html(score);
            $(".score-change").animate({
                top: '-25px'
            }, {
                duration: 1000,
                complete: function() {
                    $(".score-change")
                        .html("")
                        .css("top", "-10px");
                }
            });
            clearTimeout(gameTimer);
            this.setupNextRound();
        }
    };

    this.onResize = function(event) {
        if ($(window).width() != windowWidth) {
            windowWidth = $(window).width();

            if (injectedStyleDiv) {
                injectedStyleDiv.html("");
            }

            var lis = $(".game-grid").children("li");

            var liMaxWidth = _.max(lis, function(li) {
                return $(li).width();
            });
            var maxWidth = $(liMaxWidth).width();

            var styles = "<style>";
            styles += " ul.game-grid { width: " + (maxWidth * 4) + "px; } ";
            styles += " .game-grid li { height: " + maxWidth + "px; width: " + maxWidth + "px; } ";
            styles += " .game-grid li .content { font-size: " + (maxWidth * 0.5) + "px; } ";
            styles += " #result-content { font-size: " + (maxWidth * 0.8) + "px; } ";
            styles += " .game-letters span { font-size: " + (maxWidth * 0.2) + "px; margin-left: " + (maxWidth * 0.1) + "px; } ";
            styles += "</style>";

            if (injectedStyleDiv) {
                injectedStyleDiv.html(styles);
            } else {
                injectedStyleDiv = $("<div />", {
                    html: styles
                }).appendTo("body");
            }
        }
    };
    this.preloadImage = function() {
        var imgLove = new Image();
        imgLove.src = "images/love.png";
    };

    // Game status operation
    this.initGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.INITIAL;

        this.preloadImage();

        window.addEventListener("resize", this.onResize.bind(this), false);

        FastClick.attach(document.body);

        $(".btn-play").click(function() {
            self.startGame();
        });

        $(".icon-repeat").click(function() {
            self.startGame();
        });
    };
    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        var self = this;

        score = 0;
        roundNumber = 0;

        $("#timer").show();
        $("#replay").hide();

        // set to 0 to force resize
        windowWidth = 0;
        this.onResize();

        $(".panel-main").hide();
        $(".panel-game").show();
        $('html, body').animate({
            scrollTop: $(".panel-container").offset().top
        }, 'fast');

        
        swal({
            title: "Choose a Numeric Type",
            showCancelButton: true,
            confirmButtonText: "1 2 3",
            confirmButtonColor: "#ff0000",
            cancelButtonText: "I II III"
        }, function(confirmed) {
            if (confirmed) {
                selectedNumeralType = "arabic";
                numerals = arabicNumerals;
            } else {
                selectedNumeralType = "roman";
                numerals = romanNumerals;
            }
            self.setupGameNode();
        });
    };
    this.endGame = function() {
        gameState = GAME_STATE_ENUM.END;

        var self = this;

        $(".game-grid").html("");

        var endNumerals = _.first(numerals, 8);
        var shuffleEndNumerals = _.shuffle(endNumerals);

        var gameover = ["G", "A", "M", "E", "O", "V", "E", "R"];

        _.each(_.first(shuffleEndNumerals, 4), function(endNumeral) {
            $(".game-grid").append("<li><div class='content animated fadeIn'>" + endNumeral + "</li>");
        });

        _.each(gameover, function(letter) {
            $(".game-grid").append("<li><div class='content animated fadeIn'>" + letter + "</li>");
        });

        _.each(_.last(shuffleEndNumerals, 4), function(endNumeral) {
            $(".game-grid").append("<li><div class='content animated fadeIn'>" + endNumeral + "</li>");
        });

        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);

        var imageNumeral = (selectedNumeralType == "arabic" ? "images/1_2_3.png" : "images/I_II_III.png");
        swal({
            title: "Congratulations!",
            text: "Your score is " + score + "! :D",
            imageUrl: imageNumeral
        });

        selectedNumbers = [];
        $("ul.game-grid li").click(function() {

            if (!$(this).hasClass("selected")) {
                var selectedNumber = $(this.firstChild).html();
                if (selectedNumber == endNumerals[selectedNumbers.length]) {
                    $(this).addClass("selected");
                    selectedNumbers.push(selectedNumber);

                    if (selectedNumbers.length == endNumerals.length) {
                        swal({
                            title: "Thanks for playing!!!",
                            imageUrl: "images/love.png"
                        })
                    }
                } else {
                    if (selectedNumber != "") {
                        $(this.firstChild).addClass("animated shake");
                        $(this.firstChild).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                            $(this.firstChild).removeClass("animated shake");
                        });
                    }
                }
            }
        });
    };

    // Check game state
    this.isGameStateInitial = function() {
        return gameState == GAME_STATE_ENUM.INITIAL;
    };
    this.isGameStateStart = function() {
        return gameState == GAME_STATE_ENUM.START;
    };
    this.isGameStateEnd = function() {
        return gameState == GAME_STATE_ENUM.END;
    };
};

$(function() {
    XMing.GameStateManager.initGame();
})