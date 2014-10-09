var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var gameState;
    var gameTimer;
    var remainingTime;
    var score = 0;

    var arabicNumerals = _.each(_.range(1, 17), function(number) {
        return number + "";
    });
    var romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"];
    var numerals = romanNumerals;

    var roundNumber = 0;
    var selectedNumbers = [];

    var injectedStyleDiv;

    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    this.init = function() {
        window.addEventListener("resize", this.onResize.bind(this), false);
        this.initGame();
    };

    this.loadGrid = function() {

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

    this.loadData = function() {
        var self = this;

        roundNumber++;

        this.loadGrid();

        remainingTime = roundNumber + 3;
        $("#timer-value").html(Math.floor(remainingTime))
            .removeClass("animated fadeIn");

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

                self.loadNextRound();
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
                }
                else {
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
            this.loadNextRound();
        }
    };

    this.loadNextRound = function() {
        var self = this;

        var gameGrid = $("ul.game-grid");
        $("#result")
            .width(gameGrid.width())
            .height(gameGrid.height())
            .show();

        _.delay(function() {
            $("#result").hide();

            if (roundNumber < numerals.length) {
                self.loadData();
            } else {
                self.endGame();
            }
        }, 1000);
    };

    this.onResize = function(event) {
        var lis = $(".game-grid").children("li");

        var liMaxWidth = _.max(lis, function(li) {
            return $(li).width();
        });
        var maxWidth = $(liMaxWidth).width();

        _.each(lis, function(li) {
            $(li).height(maxWidth);
        });

        var styles = "<style>" + ".game-grid li { height: " + maxWidth + "px; } " + ".game-grid li .content { font-size: " + (maxWidth * 0.5) + "px; } " + "#result-content { font-size: " + (maxWidth * 0.8) + "px; } " + ".game-letters span { font-size: " + (maxWidth * 0.2) + "px; margin-left: " + (maxWidth * 0.1) + "px; } " + "</style>";

        if (injectedStyleDiv) {
            injectedStyleDiv.html(styles);
        } else {
            injectedStyleDiv = $("<div />", {
                html: styles
            }).appendTo("body");
        }
    };

    this.preloadImage = function() {
        var imgLove = new Image();
        imgLove.src = "images/love.png";
    };

    // game status operation
    this.initGame = function() {
        gameState = GAME_STATE_ENUM.INITIAL;
        this.preloadImage();

        var self = this;
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
        this.onResize();

        swal({
            title: "Choose a\nNumeric Type",
            showCancelButton: true,
            confirmButtonText: "1 2 3",
            cancelButtonText: "I II III"
        }, function() {
            numerals = arabicNumerals;
            self.loadData();
        }, function() {
            numerals = romanNumerals;
            self.loadData();
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

        swal({
            title: "Congratulations!",
            text: "Your score is " + score + "! :D",
            imageUrl: "images/word-grid.png"
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
                }
                else {
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

    // check game state
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