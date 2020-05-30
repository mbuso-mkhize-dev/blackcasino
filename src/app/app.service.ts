import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CardGameService {

    public Deck: Card[];

    public Players: Player[];

    public TableCards: Card[] = [];

    public GenFinisherResults;



    constructor() { }

    public AddPlayers(Players, name) {
        //Players = [];
        Players.push(new Player(
            name,
            [],
            [],
            new Build(0, [], true),
        ));
        Players.push(new Player(
            "Dealer",
            [],
            [],
            new Build(0, [], true),
        ));
    }
    public GenerateCardsForDeck(Deck) {
        let suit = new Suits();
        let suitType = new SuitType();
        //Deck = [];
        for (let element of suitType.SuitTypeList) {
            for (let i = 1; i <= 10; i++) {
                let suitValue = "";
                let suitTypes = "";
                let poVal = 0;
                let isPoCard = false;

                if (suitType.Clubs == element) {
                    suitValue = suit.Clubs;
                    suitTypes = suitType.Clubs;
                }

                if (suitType.Spades == element) {
                    suitValue = suit.Spades;
                    suitTypes = suitType.Spades;
                }

                if (suitType.Hearts == element) {
                    suitValue = suit.Hearts;
                    suitTypes = suitType.Hearts;
                }

                if (suitType.Diamonds == element) {
                    suitValue = suit.Diamonds;
                    suitTypes = suitType.Diamonds;
                }

                let genVal = "";

                if (i == 1) {
                    genVal = "A" + suitValue;
                    poVal = 1;
                    isPoCard = true;
                }
                else {
                    genVal = i + "" + suitValue;
                }

                if (suitType.Diamonds == element && i == 10) {
                    poVal = 2;
                    isPoCard = true;
                }

                if (suitType.Spades == element && i == 2) {
                    poVal = 1;
                    isPoCard = true;
                }

                Deck.push(new Card
                    (
                        i,
                        suitTypes,
                        suitValue,
                        genVal,
                        isPoCard,
                        poVal,
                        i == 1 ? 'A' : i
                    ));
            }

        }
    }

    public ShuffleCards(Deck) {
        if (Deck != null && Deck.length > 0) {
            let temp = [];
            Math.floor(Math.random() * 10);

            for (let i = 0; i < 40; i++) {
                let length = Deck.length;
                let n = Math.floor(Math.random() * length);;
                temp.push(Deck[n]);
                Deck.splice(n, 1);
            }

            for (let card of temp) {
                Deck.push(card);
            }
        }
    }

    public CardCut(Deck) {
        if (Deck != null && Deck.length > 0) {
            for (let i = 0; i < 10; i++) {
                this.array_move(Deck, 20, 0);
            }
        }

    }

    public array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            let k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    }

    public Deal(Players, TableCards, Deck) {
        //TableCards = [];
        let cardlength = 10;
        if (Players.length == 3) {
            cardlength = 13;
            TableCards.push(Deck[0]);
            Deck.splice(0, 1);
        }
        for (let player of Players) {
            for (let i = 0; i < cardlength; i++) {
                player.UserHand.push(Deck[0]);
                Deck.splice(0, 1);
            }
        }


    }

    public SimpleCaputue(player: Player, cardValue: string, mapedCards: string[], Dealer, TableCards) {
        let playerPilesAval = Dealer.UserPile[0];

        let available = [];

        if (playerPilesAval != undefined) {
            available.push(playerPilesAval);
        }
        available = available.concat(TableCards);

        let cardDown = player.UserHand.filter(c => c.Value == cardValue)[0];

        let potentialBuild = new Build(player.UserBuild.Number, [], true);
        potentialBuild.Number = cardDown.Number;


        potentialBuild.Cards.push(cardDown);

        potentialBuild.Cards = potentialBuild.Cards.concat(available.filter(c => mapedCards.includes(c.Value)));


        if ((potentialBuild.Cards.map(c => c.Number).reduce((a, b) => a + b, 0) % potentialBuild.Number) == 0) {


            for (let plycrd of potentialBuild.Cards) {

                this.removeItem(Dealer.UserPile, plycrd);
                this.removeItem(TableCards, plycrd);

            }



            player.UserPile = player.UserPile.concat(potentialBuild.Cards);
        }

    }

    public GetAvailablePileCardFromPlayers(Dealer) {
        // for now
        let playerPilesAval = Dealer.UserPile[0];
        return playerPilesAval;

        let toreturn = [];
        this.Players.forEach(element => {
            if (element.UserPile.length > 0 && element.Name.includes("Player")) {

            }
        });
    }

    removeItem(array, item) {
        let index = array.indexOf(item);

        if (index !== -1) array.splice(index, 1);
    }
    public CaptureOwnBuild(player: Player, card) {
        if (card === null) {
            card = player.UserHand.filter(c => c.Number == player.UserBuild.Number)[0];
        }
        player.UserBuild.Cards.push(card);
        player.UserPile = player.UserPile.concat(player.UserBuild.Cards);
        player.UserBuild = new Build(0, [], true);
        this.removeItem(player.UserHand, card);;

    }

    public BuildCards(player: Player, cardValue: string, cardsToAdd, Dealer, TableCards) {
        let potentialBuild = new Build(player.UserBuild.Number, [], true);
        potentialBuild.Number = player.UserBuild.Number;

        let cardDown = player.UserHand.find(c => c.Value == cardValue);
        potentialBuild.Cards.push(cardDown);

        // subject to change
        let playerPilesAval = Dealer.UserPile[0];

        let available = [];

        if (playerPilesAval != undefined) {
            available.push(playerPilesAval);
        }
        available = available.concat(TableCards);

        potentialBuild.Cards = potentialBuild.Cards.concat(available.filter(c => cardsToAdd.includes(c.Value)));
        let sumOfAll = potentialBuild.Cards.map(c => c.Number).reduce((a, b) => a + b, 0);
        if ((sumOfAll % potentialBuild.Number) == 0) {


            for (let plycrd of potentialBuild.Cards) {

                this.removeItem(Dealer.UserPile, plycrd);
                this.removeItem(TableCards, plycrd);
            }


            player.UserBuild.Cards = player.UserBuild.Cards.concat(potentialBuild.Cards);

            if (player.UserBuild.Cards.length > 3 ||
                player.UserBuild.Cards.length != player.UserBuild.Cards.map(c => c.Number).filter((value, index, self) => { return self.indexOf(value) === index; }).length) {
                player.UserBuild.IsAvailableForSteal = false;
            }
        }
    }

    public PlayerFinishUp(player: Player, Dealer, TableCards) {
        let match = true;
        while (match) {
            let playerPilesAval = Dealer.UserPile[0];

            let available = [];

            if (playerPilesAval != undefined) {
                available.push(playerPilesAval);
            }
            available = available.concat(TableCards);

            available = Array.from(available.filter(c => c.Number <= player.UserBuild.Number));

            let potentialBuild = new Build(player.UserBuild.Number, [], true);

            potentialBuild.Cards = potentialBuild.Cards.concat(available.filter(c => c.Number == potentialBuild.Number));

            this.GenFinisherResults = [];

            this.GenFinisher(available.filter(c => c.Number < potentialBuild.Number).map(c => c.Number), potentialBuild.Number);

            let finalList = this.GenFinisherResults.filter(c => c.includes(1) || c.includes(10) || c.includes(2))[0];

            if (finalList == null) {
                finalList = this.GenFinisherResults[0];
            }

            if (finalList != null) {
                let cardsToAdd = [];
                for (let v of finalList) {
                    let crd = available.filter(c => c.Number == v)[0];
                    if (crd != null) {
                        cardsToAdd.push(crd);
                        this.removeItem(available, crd);
                    }
                }


                potentialBuild.Cards = potentialBuild.Cards.concat(cardsToAdd);


                for (let plycrd of potentialBuild.Cards) {
                    this.removeItem(Dealer.UserPile, plycrd);
                    this.removeItem(TableCards, plycrd);
                }


                player.UserBuild.Cards = player.UserBuild.Cards.concat(potentialBuild.Cards);
            }
            else {
                match = false;
                break;
            }
        }
    }

    public StealBuildCards(player: Player, cardValue, Dealer) {
        let playerBuilds = [];
        if (Dealer.UserBuild.Cards.length < 3 || (Dealer.UserBuild.Cards.length < 4 && !Dealer.UserBuild.Cards.includes(c => c.Number == Dealer.UserBuild.Number))) {
            playerBuilds.push(Dealer.UserBuild);
        }
        if (playerBuilds.length > 0) {

            for (let plyBuild of playerBuilds) {
                if (plyBuild.Number < player.UserBuild.Number) {
                    let dif = player.UserBuild.Number - plyBuild.Number;

                    let cadsAval = player.UserHand.filter(c => c.Number == dif);
                    if (cadsAval.length > 0) {
                        let crd = cadsAval.filter(c => c.Value == cardValue.Value)[0];
                        if (crd != null) {
                            plyBuild.Cards.push(crd);
                            player.UserBuild.Cards = player.UserBuild.Cards.concat(plyBuild.Cards);
                            plyBuild.Cards = [];
                            this.removeItem(player.UserHand, crd);

                        } else {
                            return false;
                        }
                        return true;
                    }
                }
            }

        }

        return false;
    }

    public ThrowCardToTable(player: Player, cardValue: string, TableCards) {
        let card = player.UserHand.filter(c => c.Value == cardValue)[0];

        if (card != null) {
            TableCards.push(card);

            this.removeItem(player.UserHand, card);
        }
    }

    public SetBuildNumber(player: Player, num) {
        if (!this.Players.map(c => c.UserBuild.Number).includes(num)) {
            player.UserBuild.Number = num;
            player.UserBuild.IsAvailableForSteal = true;
        }

    }

    public GetAllUserHandCardlength() {

        //return this.Players.mapMany(c => c.UserHand).length;  arr.reduce(function(a, b){ return a.concat(b); });

        return this.Players.map(c => c.UserHand).reduce(function (a, b) { return a.concat(b); }).length;
    }



    public GenFinisher(numbers, target) {
        this.SumUpRecursive(numbers, target, []);
    }

    // Before youy get here
    // No number must be greater than target, and
    // No number must be equal to target
    public SumUpRecursive(numbers, target, partial) {
        let s = 0;
        partial.forEach(x => {
            s += x;
        });

        if (s == target)
            this.GenFinisherResults.push(partial);

        if (s >= target)
            return;

        for (let i = 0; i < numbers.length; i++) {
            let remaining = [];
            let n = numbers[i];
            for (let j = i + 1; j < numbers.length; j++) remaining.push(numbers[j]);

            let partial_rec = Array.from(partial);
            partial_rec.push(n);
            this.SumUpRecursive(remaining, target, partial_rec);
        }
    }

    public NumbersThatAddUp(numbers:number[], targetNum) {

        //numbers = numbers.filter(c => c < targetNum);
        let numsThatAdd = [];
        for (let i = 1; i <= targetNum; i++) {
            if (i > numbers.length) {
                break;
            }
            for (let x = 1; x <= numbers.length; x++) {
                let num = numbers[x];
                let potAdd = [];
                let numfiltered = numbers.filter(c => c == num);
                for (let j = 1; j <= i; j++) {
                   potAdd.push(numfiltered[j]);

                }
                let d = potAdd.reduce((a, b) => a + b, 0);
                if(num + d == targetNum){
                    potAdd.push(num);
                    if(numsThatAdd.indexOf(potAdd.sort()) === -1){
                        numsThatAdd.push(potAdd.sort());
                    }
                }               
            }
        }


        for (let num in numbers) {
            let temp = 0;
            let potAdd = [];
            for (let numPot in numbers) {
                if (numPot + num < targetNum) {
                    if (numPot + num == targetNum) {
                        numsThatAdd.push(numPot);
                        numsThatAdd.push(num);
                    } else {

                    }
                }
            }
        }
    }

    public DealerCaptureOrBuild(Dealer, TableCards, Player) {
        //Dealer.UserBuild.Number = Math.max.apply(null, Dealer.UserHand.map(c => c.Number));
        let steal = this.DealerStealBuild(Dealer, TableCards, Player);
        let built = false;
        let captureOwnBuild = false;
        if (!steal) {
            built = this.DealerBuild(Dealer, TableCards, Player);
        }

        if (!built && !steal) {
            // Capture
            if (Dealer.UserHand.length < 2) {
                captureOwnBuild = this.DealerCaptureBuild(Dealer, Player, TableCards);
            }


            if (!captureOwnBuild) {
                if (!this.DealerLongCapture(Dealer, TableCards, Player)) {
                    this.ThrowCard(Dealer, TableCards);
                }
            }

        }
    }

    public DealerStealBuild(Dealer, TableCards, Player) {
        let potentialBuildAlmost = new Build(Dealer.UserBuild.Number, [], false);
        let playerBuilds = [];
        if (Player.UserBuild.Cards.length < 3 && Player.UserBuild.IsAvailableForSteal) {

            playerBuilds.push(Player.UserBuild);
        }

        // Steall build for capture
        for (let dealerCard of Dealer.UserHand) {
            if (dealerCard.Number == Player.UserBuild.Number && Player.UserBuild.Cards.length > 2) {
                Dealer.UserPile = Dealer.UserPile.concat(Player.UserBuild.Cards);
                Dealer.UserPile.push(dealerCard);
                Player.UserBuild.Cards = [];
                this.removeItem(Dealer.UserHand, dealerCard);
                return true;
            }
        }

        // steal for build
        if (playerBuilds.length > 0) {
            let breackAll = false;
            for (let plyBuild of playerBuilds) {

                for (let dealerCard of Dealer.UserHand) {
                    if (plyBuild.Number + dealerCard.Number == Dealer.UserBuild.Number) {
                        plyBuild.Cards.push(dealerCard);
                        Dealer.UserBuild.Cards = Dealer.UserBuild.Cards.concat(plyBuild.Cards);
                        plyBuild.Cards = [];
                        breackAll = true;
                        break;
                    }
                }

                if (breackAll) {
                    this.FinishUp(Dealer.UserBuild.Cards, Dealer.UserBuild.Number, TableCards, Dealer, Player);
                    break;
                }
            }


            if (breackAll)
                return true;
        }

        return false;
    }

    public DealerBuild(Dealer, TableCards, Player) {
        let potentialBuildAlmost = new Build(Dealer.UserBuild.Number, [], true);

        let playerPilesAval = Player.UserPile[Player.UserPile.length - 1];

        let available = [];
        if (playerPilesAval != undefined) {
            if (Dealer.UserBuild.Cards.length > 0) {
                available.push(playerPilesAval);
            }

        }

        available = available.concat(TableCards);
        let isLowerThanNum = Dealer.UserHand.filter(c => c.Number < Dealer.UserBuild.Number).length > 0;
        let availCapHere = Dealer.UserHand.filter(c => c.Number < Dealer.UserBuild.Number);

        for (let dealerCard of availCapHere) {
            available = Array.from(available.filter(c => c.Number <= Dealer.UserBuild.Number));
            available.push(dealerCard);

            let potentialBuild = new Build(Dealer.UserBuild.Number, [], true);

            potentialBuild.Cards = potentialBuild.Cards.concat(available.filter(c => c.Number == potentialBuild.Number));

            this.GenFinisherResults = [];

            this.GenFinisher(available.filter(c => c.Number < potentialBuild.Number).map(c => c.Number), potentialBuild.Number);

            let finalList = this.GenFinisherResults.filter(c => c.includes(1) || c.includes(10) || c.includes(2))[0];

            if (finalList == null) {
                finalList = this.GenFinisherResults[0];
            }

            if (finalList != null) {
                let cardsToAdd = [];

                for (let v of finalList) {
                    let crd = available.filter(c => c.Number == v)[0];
                    if (crd != null) {
                        cardsToAdd.push(crd);
                        this.removeItem(available, crd);
                    }
                }

                if (cardsToAdd.includes(dealerCard)) {
                    potentialBuildAlmost.Cards = potentialBuildAlmost.Cards.concat(cardsToAdd);
                    this.removeItem(Dealer.UserHand, dealerCard);
                    break;
                }
            }

            this.removeItem(available, dealerCard);
        }


        // After loop
        if (potentialBuildAlmost.Cards.length > 0) {

            for (let plycrd of potentialBuildAlmost.Cards) {
                this.removeItem(Player.UserPile, plycrd);
                this.removeItem(TableCards, plycrd);
                Dealer.UserBuild.Cards.push(plycrd);
            }


            this.FinishUp(Dealer.UserBuild.Cards, Dealer.UserBuild.Number, TableCards, Dealer, Player);
            return true;
        }

        return false;
    }

    public DealerLongCapture(Dealer, TableCards, Player) {
        let potentialBuildAlmost = new Build(Dealer.UserBuild.Number, [], true);

        let playerPilesAval = TableCards.length > 0 ? Player.UserPile[Player.UserPile.length - 1] : undefined;

        let available = [];
        let firstTimeAround = true;
        //if (playerPilesAval != undefined) {

        //    available.push(playerPilesAval);
        //}
        available = available.concat(TableCards);

        let availCapHere = Dealer.UserHand.filter(c => c.Number < Dealer.UserBuild.Number);
        for (let dealerCard of Dealer.UserHand) {
            if (dealerCard.Number == Dealer.UserBuild.Number) {
                let groups = Dealer.UserHand.filter(c => c.Number);
                if (groups.length < 2) {
                    continue;
                }
            }
            //available = Array.from(available.filter(c => c.Number <= Dealer.UserBuild.Number));

            let potentialBuild = new Build(dealerCard.Number, [], true);
            potentialBuildAlmost.Number = dealerCard.Number;

            potentialBuildAlmost.Cards = potentialBuildAlmost.Cards.concat(available.filter(c => c.Number == potentialBuild.Number));
            if (potentialBuildAlmost.Cards.length > 0) {
                potentialBuildAlmost.Cards.push(dealerCard);
                this.removeItem(Dealer.UserHand, dealerCard);
                break;
            }
            this.GenFinisherResults = [];

            this.GenFinisher(available.filter(c => c.Number < potentialBuild.Number).map(c => c.Number), potentialBuild.Number);

            let finalList = this.GenFinisherResults.filter(c => c.includes(1) || c.includes(10) || c.includes(2))[0];

            if (finalList == null) {
                finalList = this.GenFinisherResults[0];
            }

            if (finalList != null) {
                let cardsToAdd = [];
                for (let v of finalList) {
                    let crd = available.filter(c => c.Number == v)[0];
                    if (crd != null) {
                        cardsToAdd.push(crd);
                        this.removeItem(available, crd);
                    }
                }
                if (cardsToAdd.includes(playerPilesAval)) {
                    if (cardsToAdd.length < 2) {
                        available = available.concat(cardsToAdd);
                        cardsToAdd = [];
                        if (this.GenFinisherResults.length > 1) {
                            for (let v of this.GenFinisherResults[1]) {
                                let crdr = available.filter(c => c.Number == v)[0];
                                if (crdr != null) {
                                    cardsToAdd.push(crdr);
                                    this.removeItem(available, crdr);
                                }
                            }
                            if (cardsToAdd.includes(playerPilesAval) && cardsToAdd.length < 2) {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    }
                }
                if (cardsToAdd.length > 0) {
                    potentialBuildAlmost.Cards = potentialBuildAlmost.Cards.concat(cardsToAdd);
                    potentialBuildAlmost.Cards.push(dealerCard);
                    this.removeItem(Dealer.UserHand, dealerCard);
                    break;
                }
            }
        }


        // After loop
        if (potentialBuildAlmost.Cards.length > 0) {


            for (let plycrd of potentialBuildAlmost.Cards) {
                this.removeItem(Player.UserPile, plycrd);
                this.removeItem(TableCards, plycrd);
                Dealer.UserPile.push(plycrd);
            }


            this.FinishUp(Dealer.UserPile, potentialBuildAlmost.Number, TableCards, Dealer, Player);

            return true;
        }

        return false;
    }

    public DealerCaptureBuild(Dealer, Player, TableCards) {
        let player = Dealer;
        if (player.UserBuild.Cards.length > 0) {
            let capCard = player.UserHand.filter(c => c.Number == player.UserBuild.Number)[0];
            if (capCard != null) {
                player.UserBuild.Cards.push(capCard);
                player.UserPile = player.UserPile.concat(player.UserBuild.Cards);
                player.UserBuild = new Build(0, [], true);
                this.removeItem(player.UserHand, capCard);;
                this.FinishUp(player.UserBuild.Cards, player.UserBuild.Number, TableCards, Dealer, Player);
                return true;
            }
        }
    }


    public ThrowCard(Dealer, TableCards) {
        // for now
        let availableForThrow = Dealer.UserHand.filter(c => c.Number != Dealer.UserBuild.Number);
        if (availableForThrow.length < 1 && Dealer.UserHand.length < 2 && Dealer.UserHand.length > 0) {
            TableCards.push(Dealer.UserHand[0]);

            this.removeItem(Dealer.UserHand, Dealer.UserHand[0]);

            return;
        }
        if (availableForThrow.length > 0) {
            let card = availableForThrow.sort((a, b) => (a.Number > b.Number) ? 1 : ((b.Number > a.Number) ? -1 : 0))[0];

            if (card != null) {
                TableCards.push(card);

                this.removeItem(Dealer.UserHand, card);
            }
        }
        else {
            let cardToThrow = Dealer.UserHand.sort()[0];
            if (cardToThrow != null) {
                TableCards.push(cardToThrow);

                this.removeItem(Dealer.UserHand, cardToThrow);
            }
        }
    }

    public FinishUp(cards: Card[], buildNumber: Number, TableCards, Dealer, Player) {
        let potentialBuildAlmost = new Build(Dealer.UserBuild.Number, [], true);
        let playerPilesAval = Player.UserPile[Player.UserPile.length - 1];

        let available = [];

        if (playerPilesAval != undefined) {
            available.push(playerPilesAval);
        }
        available = available.concat(TableCards);
        let match = true;
        while (match) {
            available = Array.from(available.filter(c => c.Number <= buildNumber));

            let potentialBuild = new Build(buildNumber, [], true);

            potentialBuildAlmost.Cards = potentialBuildAlmost.Cards.concat(available.filter(c => c.Number == potentialBuild.Number));

            this.GenFinisherResults = [];

            this.GenFinisher(available.filter(c => c.Number < potentialBuild.Number).map(c => c.Number), potentialBuild.Number);

            let finalList = this.GenFinisherResults.filter(c => c.includes(1) || c.includes(10) || c.includes(2))[0];

            if (finalList == null) {
                finalList = this.GenFinisherResults[0];
            }

            if (finalList != null) {
                if (finalList.length < 1) {
                    match = false;
                    break;
                }
                let cardsToAdd = [];
                for (let v of finalList) {
                    let crd = available.filter(c => c.Number == v)[0];
                    if (crd != null) {
                        cardsToAdd.push(crd);


                        this.removeItem(available, crd);
                        if (crd == playerPilesAval) {
                            if (Player.UserPile.length > 0) {
                                playerPilesAval = Player.UserPile[Player.UserPile.length - 1];
                                available.push(playerPilesAval);
                            }
                        }
                    }
                };

                potentialBuild.Cards = potentialBuild.Cards.concat(cardsToAdd);

                potentialBuildAlmost.Cards = potentialBuildAlmost.Cards.concat(potentialBuild.Cards);
            }
            else {
                match = false;
                break;
            }
        }

        // After loop



        for (let plycrd of potentialBuildAlmost.Cards) {
            this.removeItem(Player.UserPile, plycrd);
            this.removeItem(TableCards, plycrd);
            cards.push(plycrd);
        }


    }

}

export class Card {

    constructor(
        number,
        suitType,
        suitValue: string,
        value: string,
        isPoCard: boolean,
        PointValue: Number,
        rank) {
        this.Number = number;
        this.IsPoCard = isPoCard;
        this.PointValue = PointValue;
        this.SuitType = suitType;
        this.SuitValue = suitValue;
        this.Value = value;
        this.Rank = rank;

    }
    public Number;

    public SuitType: string;

    public SuitValue: string;

    public Value: string;

    public IsPoCard: boolean;

    public PointValue;

    public Rank;
}

export class Build {

    constructor(
        number,
        cards: Card[],
        IsAvailableForSteal: boolean) {
        this.Number = number;
        this.Cards = cards;
        this.IsAvailableForSteal = IsAvailableForSteal;

    }

    public Number;

    public Cards: Card[];

    public IsAvailableForSteal: boolean;

}

export class Suits {

    public Clubs: string = "C";

    public Diamonds: string = "D";

    public Hearts: string = "H";

    public Spades: string = "S";
}

export class SuitType {

    public Clubs: string = "club";

    public Diamonds: string = "diamond";

    public Hearts: string = "heart";

    public Spades: string = "spade";

    public SuitTypeList: string[] = ["club", "diamond", "heart", "spade"];

}

export class Player {

    constructor(
        name: string,
        UserHand: Card[],
        UserPile: Card[],
        UserBuild: Build) {
        this.Name = name;
        this.UserHand = UserHand;
        this.UserPile = UserPile;
        this.UserBuild = UserBuild;

    }
    public Name: string;

    public UserHand: Card[];

    public UserPile: Card[];

    public UserBuild: Build;
}