var XMing = XMing || {};

XMing.GameStateManager = new function() {
    var windowWidth = 0;
    var gameState;
    var userData;
    var gameTimer;
    var remainingTime;
    var roundStartTime;
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

    var VERSION_NUMBER = 1;
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
            $(".game-grid").append("<li><div class='content animated fadeIn'>" + number + "</li>");
        });

        $(".game-grid .animated.fadeIn").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass("animated fadeIn");
        });
    };
    this.setupGameNode = function() {
        var self = this;

        roundNumber++;

        this.setupGrid();

        roundStartTime = new Date();
        remainingTime = roundNumber + 3.5;

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
                    .css("color", "#11BDFF");
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

        // +2px for the border
        $("#result")
            .width(gameGrid.width() + 2)
            .height(gameGrid.height() + 2)
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
                .css("color", "#0F0");

            var roundEndTime = new Date();
            var timeGiven = roundNumber + 3.0;
            var timeRemained = timeGiven - (roundEndTime.getTime() - roundStartTime.getTime()) / 1000;
            var scoreGained = Math.ceil(timeRemained * 10);
            score += scoreGained;
            $(".score-change")
                .html("+" + scoreGained)
                .css("color", "#0F0");

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

    this.onResize = function() {
        if ($(window).width() != windowWidth) {
            windowWidth = $(window).width();

            if (injectedStyleDiv) {
                injectedStyleDiv.html("");
            }

            var lis = $(".game-grid").children("li");

            var liMaxWidth = _.max(lis, function(li) {
                return $(li).width();
            });
            // +2px for the li border
            var liWidth = $(liMaxWidth).width() + 2;

            var styles = "<style>";
            // + 2px for the ul border
            styles += " ul.game-grid { width: " + (liWidth * 4 + 2) + "px; } ";
            styles += " .game-grid li { height: " + liWidth + "px; width: " + liWidth + "px; } ";
            styles += " .game-grid li .content { font-size: " + (liWidth * 0.5) + "px; } ";
            styles += " #result-content { font-size: " + (liWidth * 0.8) + "px; } ";
            styles += " .game-letters span { font-size: " + (liWidth * 0.2) + "px; margin-left: " + (liWidth * 0.1) + "px; } ";
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

        var imgRedEgg = new Image();
        imgRedEgg.src = "images/red-egg.png";

        var imgBlueEgg = new Image();
        imgBlueEgg.src = "images/blue-egg.png";

        var imgNinjaEgg = new Image();
        imgNinjaEgg.src = "images/ninja-egg.png";
    };

    // Game status operation
    this.initGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.INITIAL;

        window.addEventListener("resize", this.onResize.bind(this), false);

        FastClick.attach(document.body);

        this.preloadImage();

        userData = this.loadData();

        swal.setDefaults({
            confirmButtonColor: '#F53B3B'
        });

        $(".mfb-component__button--main").click(function() {
            if ($(this).parent().parent().attr('data-mfb-state') === "open") {
                $(".overlay").addClass("active");
            } else {
                $(".overlay").removeClass("active");
            }
        });

        $(".btn-play").click(function() {
            self.startGame();
        });

        $(".btn-leaderboard").click(function() {
            self.showLeaderboard();
        });

        $(".icon-back").click(function() {
            $(".panel-game, .panel-leaderboard").hide();
            $(".panel-main").fadeIn();
        });

        $(".icon-repeat").click(function() {
            self.startGame();
        });

        this.checkPlayedEasterEgg();
    };
    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        var self = this;

        score = 0;
        roundNumber = 0;

        $(".panel-main, #replay").hide();
        $(".panel-game, #timer").fadeIn();
        $('html, body').animate({
            scrollTop: $(".panel-container").offset().top
        }, 'fast');

        // set to 0 to force resize
        windowWidth = 0;
        this.onResize();

        swal({
            title: "Choose a Numeric Type",
            showCancelButton: true,
            confirmButtonText: "1 2 3",
            confirmButtonColor: "#FF0000",
            cancelButtonText: "I II III",
            customClass: 'choose'
        }, function(isConfirm) {
            if (isConfirm) {
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


        $("li .animated.fadeIn").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass("animated fadeIn");
        });

        $("#timer").hide();
        $("#replay").fadeIn();
        $("#score-value").html(score);

        var imageNumeral = (selectedNumeralType == "arabic" ? "images/1_2_3.png" : "images/I_II_III.png");
        swal({
            title: "Congratulations!",
            text: "Your score is " + score + "! :D",
            imageUrl: imageNumeral,
            closeOnConfirm: false
        }, function() {
            var postingInProgress = false;
            swal({
                title: "Thanks for playing!!!",
                imageUrl: "images/love.png",
                type: "input",
                text: "Write your name here! It will appear in the leaderboard!",
                inputValue: userData.username,
                closeOnConfirm: false
            }, function(playerName) {
                if (playerName == "") {
                    swal.showInputError("You need to write something! A nickname is fine too!");
                    return false;
                }

                if (postingInProgress) {
                    return false;
                } else {
                    postingInProgress = true;
                    $.ajax({
                        method: "POST",
                        url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                        contentType: "application/json",
                        data: JSON.stringify({
                            game_id: 5,
                            username: playerName,
                            score: score
                        })
                    }).success(function(data) {
                        swal("Congratulations!", "You are currently ranked " + data.rank_text + "!", "success");
                        userData.username = playerName;
                        self.saveData(userData);
                    }).fail(function() {
                        swal("Oops...", "Something went wrong!", "error");
                    });
                }
            });
        });

        selectedNumbers = [];
        $("ul.game-grid li").click(function() {

            if (!$(this).hasClass("selected")) {
                var selectedNumber = $(this.firstChild).html();
                if (selectedNumber == endNumerals[selectedNumbers.length]) {
                    $(this).addClass("selected");
                    selectedNumbers.push(selectedNumber);

                    if (selectedNumbers.length == endNumerals.length) {
                        if (!userData.easterEgg.numbers) {
                            userData.easterEgg.numbers = true;
                            self.saveData(userData);
                            swal({
                                title: 'Congratulations!',
                                text: 'You have found the Red Egg!',
                                imageUrl: 'images/red-egg.png'
                            });
                            $.ajax({
                                method: "POST",
                                url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                                contentType: "application/json",
                                data: JSON.stringify({
                                    game_id: 9,
                                    username: userData.uid,
                                    score: 1
                                })
                            });
                        } else {
                            swal({
                                title: 'Hello!',
                                text: 'You have collected the Red Egg already!',
                                imageUrl: 'images/red-egg.png'
                            });
                        }

                    }
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

        if (!userData.played.numbers) {
            userData.played.numbers = true;
            this.saveData(userData);
        }
    };
    this.showLeaderboard = function() {
        $(".panel-main").hide();
        $(".panel-leaderboard, .loader").fadeIn();

        $(".highscore-list").html("");

        if (!userData.leaderboard.numbers) {
            userData.leaderboard.numbers = true;
            this.saveData(userData);
            this.checkLeaderboardEasterEgg();
        }

        $.get("http://weiseng.redairship.com/leaderboard/api/1/highscore.json?game_id=5", function(data) {
            $(".loader").fadeOut(700);

            var numDummyData = 10 - data.length;
            for (var i = 0; i < numDummyData; i++) {
                data.push({
                    username: '----------',
                    score: 0
                });
            }

            _.each(data, function(highscore, index) {
                setTimeout(function() {
                    $(".highscore-list").append('<li class="animated slideInUp">' + (index + 1) + ': ' + highscore.username + ' - ' + highscore.score + '</li>');
                }, index * 200);
            });
        }).fail(function() {
            swal("Oops...", "Something went wrong!", "error");
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

    // Easter Egg
    this.checkPlayedEasterEgg = function() {
        if (!userData.easterEgg.allGames) {
            if (_.every(userData.played)) {
                userData.easterEgg.allGames = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Blue Egg!',
                    imageUrl: 'images/blue-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 13,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };
    this.checkLeaderboardEasterEgg = function() {
        if (!userData.easterEgg.allLeaderboard) {
            if (_.every(userData.leaderboard)) {
                userData.easterEgg.allLeaderboard = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Ninja Egg!',
                    imageUrl: 'images/ninja-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 15,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };

    // Local storage
    this.saveData = function(userData) {
        if (window.localStorage) {
            window.localStorage.setItem('data', btoa(encodeURIComponent(JSON.stringify(userData))));
        }
    };
    this.loadData = function() {
        if (window.localStorage) {
            var data = window.localStorage.getItem('data');
            if (data) {
                var parsedData = JSON.parse(decodeURIComponent(atob(data)));
                // make sure version is the same
                if (parsedData.version === VERSION_NUMBER) {
                    return parsedData;
                }
            }
        }

        var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        var data = {
            played: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            leaderboard: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            squirrel: {
                level: 0,
                inHallOfFame: false
            },
            easterEgg: {
                allGames: false,
                allLeaderboard: false,
                word: false,
                numbers: false,
                specialOne: false,
                mushrooms: false,
                squirrel: false
            },
            collectAll: false,
            uid: uid,
            username: '',
            version: VERSION_NUMBER
        };

        this.saveData(data);

        return data;
    };
};

$(function() {
    XMing.GameStateManager.initGame();
})
