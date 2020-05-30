import { Component, OnInit, Inject } from '@angular/core';
import { CardGameService } from './app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  playerNumber: string;
  playerName: string;
  turn: boolean;
  round: boolean;
  gameover: boolean;
  winner: string;
  points: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private cardGameService: CardGameService, public dialog: MatDialog) {

  }
  title = 'BlackCasino';
  Players = [];
  Deck = [];


  moveupEffect = true;
  moveusideleftEffect = true;
  moverightEffect = true;
  tableCards = [];

  gameState = { playerCardSelected: false, playerBuild: false, playerCapture: false };
  dealerBuildAvailable = true;
  buildObject = { playerCard: {}, tableCards: [], dealerUserPile: [], dealerBuildCards: [] };
  captureObject = { playerCard: {}, tableCards: [], dealerUserPile: [], dealerBuildCards: [] };

  player;
  dealer;
  playerNumber = 10;
  playerName = "Player";





  openDialog() {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { playerNumber: this.playerNumber, playerName: this.playerName }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

      if (this.player.UserBuild.Cards.length < 1) {
        this.playerName = result.playerName;
        this.playerNumber = result.playerNumber;

        this.player.UserBuild.Number = this.playerNumber;
        this.player.Name = this.playerName;
        if (this.dealer.UserBuild.Cards.length < 1) {
          let dealerCardNumbers = this.dealer.UserHand.map(c => c.Number).sort((a, b) => { return b - a; });
          for (let dealerNumber of dealerCardNumbers) {
            if (dealerNumber == this.playerNumber) {
              continue;
            }
            this.dealer.UserBuild.Number = dealerNumber;
            break;
          }
        } else {
          if (this.playerNumber == this.dealer.UserBuild.Number) {
            this.openDialog();
            return;
          }
        }

      }
    });
  }

  openRoundDialog() {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { round: true }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.cardGameService.Deal([this.player, this.dealer], this.tableCards, this.Deck);
      this.openDialog();

    });
  }

  openTurnDialog() {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { turn: true }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.cardGameService.DealerCaptureOrBuild(this.dealer, this.tableCards, this.player);
      if (this.dealer.UserBuild.Cards.length > 2) {
        this.dealerBuildAvailable = false;
      }
      if (this.player.UserHand.length < 1 && this.dealer.UserHand.length < 1 && this.Deck.length > 0) {
        this.openRoundDialog();
      }
      if (this.player.UserHand.length < 1 && this.dealer.UserHand.length < 1 && this.Deck.length < 1) {
        let playerPoint = this.player.UserPile.map(c => c.PointValue).reduce((a, b) => a + b, 0);
        let dealerPoint = this.dealer.UserPile.map(c => c.PointValue).reduce((a, b) => a + b, 0);
        if (playerPoint > dealerPoint) {

          this.openGameOverDialog(this.playerName, playerPoint);
        } else {
          this.openGameOverDialog("Dealer", dealerPoint);
        }
      }
    });
  }

  openGameOverDialog(name, points) {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { gameover: true, winner: name, points: points }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }

  NumbersThatAddUp(numbers:number[], targetNum) {

    //numbers = numbers.filter(c => c < targetNum);
    let numsThatAdd = [];
    for (let i = 1; i <= targetNum; i++) {
      if (i > numbers.length) {
        break;
      }
      for (let x = 0; x <= numbers.length; x++) {
        let num = numbers[x];
        let potAdd = [];
        let numfiltered = Array.from(numbers);
        if(num === 5){
          let das = 4;
        }
        this.cardGameService.removeItem(numfiltered, num);
        for (let j = 0; j < i; j++) {
          potAdd.push(numfiltered[j]);

        }
        let d = potAdd.reduce((a, b) => a + b, 0);
        if (num + d == targetNum) {
          potAdd.push(num);
          potAdd = potAdd.sort();
          if (numsThatAdd.findIndex(c => c == potAdd) === -1) {
            numsThatAdd.push(potAdd);
          }
        }
      }
    }

    return numsThatAdd;

  }




  ngOnInit() {

    //let d = this.NumbersThatAddUp([2,3,5,5], 10);
    this.cardGameService.GenerateCardsForDeck(this.Deck);
    this.cardGameService.ShuffleCards(this.Deck);
    //this.cardGameService.CardCut(this.Deck);
    this.cardGameService.AddPlayers(this.Players, "PLayer");

    //this.cardGameService.TableCards = [];
    //this.tableCards = this.cardGameService.TableCards;
    this.cardGameService.Deal(this.Players, this.tableCards, this.Deck);

    this.player = this.Players[0];
    this.dealer = this.Players[1];
    this.player.UserHand = this.player.UserHand;
    this.dealer.UserHand = this.dealer.UserHand;


    this.openDialog();


  }

  playerCardSelected(cardValue) {
    if (this.gameState.playerBuild || this.gameState.playerCapture) {
      return;
    }
    for (let card of this.player.UserHand) {

      if (card.Value == cardValue) {
        card.Selected = true;
      } else {
        card.Selected = false;
      }

      this.gameState.playerCardSelected = true;
    }
  }

  selectTableCard(cardValue) {
    if (this.gameState.playerBuild) {
      let card = this.tableCards.find(c => c.Value == cardValue);
      this.buildObject.tableCards.push(card);
      this.player.UserBuild.Cards.push(card);
      this.cardGameService.removeItem(this.tableCards, card);
    }
    if (this.gameState.playerCapture) {
      let card = this.tableCards.find(c => c.Value == cardValue);
      this.captureObject.tableCards.push(card);
      this.player.UserPile.push(card);
      this.cardGameService.removeItem(this.tableCards, card);
    }
  }

  selectDealerPileCard(cardValue) {
    let card = this.dealer.UserPile.find(c => c.Value == cardValue);
    let isLastCard = card == this.dealer.UserPile[this.dealer.UserPile.length - 1];
    if (isLastCard) {
      if (this.gameState.playerBuild) {
        this.buildObject.dealerUserPile.push(card);
        this.player.UserBuild.Cards.push(card);
        this.cardGameService.removeItem(this.dealer.UserPile, card);
      }
      if (this.gameState.playerCapture) {
        this.captureObject.dealerUserPile.push(card);
        this.player.UserPile.push(card);
        this.cardGameService.removeItem(this.dealer.UserPile, card);
      }

    }
  }




  throwCard() {

    let card = this.player.UserHand.find(c => c.Selected == true);
    this.cardGameService.ThrowCardToTable(this.player, card.Value, this.tableCards);

    this.gameState.playerCardSelected = true;
    this.deselectPlayerCard();

    this.openTurnDialog();


  }

  deselectPlayerCard() {
    for (let card of this.player.UserHand) {
      card.Selected = false;
    }

    this.gameState.playerCardSelected = false;
  }

  build() {
    let card = this.player.UserHand.find(c => c.Selected == true);
    this.buildObject.playerCard = card;
    this.player.UserBuild.Cards.push(card);
    this.cardGameService.removeItem(this.player.UserHand, card);
    this.gameState.playerBuild = true;
    this.gameState.playerCardSelected = false;

  }

  capture() {
    let card = this.player.UserHand.find(c => c.Selected == true);
    this.captureObject.playerCard = card;
    this.player.UserPile.push(card);
    this.cardGameService.removeItem(this.player.UserHand, card);
    this.gameState.playerCapture = true;
    this.gameState.playerCardSelected = false;
  }

  captureBuild() {
    // need some thought
    let card = this.player.UserHand.find(c => c.Selected == true);
    if (card.Number == this.player.UserBuild.Number) {

      // need to bring back fail/pass
      this.cardGameService.CaptureOwnBuild(this.player, card);
      this.openDialog();
      this.gameState.playerCardSelected = false;
      // if pass
      this.openTurnDialog();
    }
  }

  stealDealerBuild() {
    // need some thought
    let card = this.player.UserHand.find(c => c.Selected == true);
    if (card != null) {
      // need to bring back fail/pass
      let success = this.cardGameService.StealBuildCards(this.player, card, this.dealer);
      // if pass
      if (success) {
        this.openTurnDialog();
      }
    }
  }

  captureDealerBuild() {
    // need some thought
    let card = this.player.UserHand.find(c => c.Selected == true);

    if (card.Number === this.dealer.UserBuild.Number) {
      this.player.UserPile = this.player.UserPile.concat(this.dealer.UserBuild.Cards);
      this.player.UserPile.push(card);
      this.dealer.UserBuild.Cards = [];
      this.cardGameService.removeItem(this.player.UserHand, card);
      this.openTurnDialog();
    }
  }

  finish() {
    if (this.gameState.playerBuild) {

      let sumCard = this.buildObject.playerCard["Number"];
      let sumCard1 = this.buildObject.dealerBuildCards.map(c => c.Number).reduce((a, b) => a + b, 0);
      let sumCard2 = this.buildObject.dealerUserPile.map(c => c.Number).reduce((a, b) => a + b, 0);
      let sumCard3 = this.buildObject.tableCards.map(c => c.Number).reduce((a, b) => a + b, 0);
      sumCard = sumCard + sumCard1 + sumCard2 + sumCard3;
      let buildNUmber = this.player.UserBuild.Number;
      let cardCount = this.buildObject.dealerBuildCards.length + this.buildObject.dealerUserPile.length + this.buildObject.tableCards.length;
      if (sumCard % buildNUmber != 0 || cardCount < 1) {

        this.player.UserHand.push(this.buildObject.playerCard);
        this.dealer.UserBuild.Cards = this.dealer.UserBuild.Cards.concat(this.buildObject.dealerBuildCards);
        this.dealer.UserPile = this.dealer.UserPile.concat(this.buildObject.dealerUserPile);
        this.tableCards = this.tableCards.concat(this.buildObject.tableCards);

        this.cardGameService.removeItem(this.player.UserBuild.Cards, this.buildObject.playerCard);
        this.player.UserBuild.Cards = this.player.UserBuild.Cards.filter(c => !this.buildObject.dealerBuildCards.includes(c));
        this.player.UserBuild.Cards = this.player.UserBuild.Cards.filter(c => !this.buildObject.dealerUserPile.includes(c));
        this.player.UserBuild.Cards = this.player.UserBuild.Cards.filter(c => !this.buildObject.tableCards.includes(c));
        this.gameState.playerBuild = false;
        this.buildObject = { playerCard: {}, tableCards: [], dealerUserPile: [], dealerBuildCards: [] };

      } else {
        this.buildObject = { playerCard: {}, tableCards: [], dealerUserPile: [], dealerBuildCards: [] };
        this.gameState.playerBuild = false;
        this.gameState.playerCardSelected = false;
        this.openTurnDialog();
      }
    }

    if (this.gameState.playerCapture) {

      let sumCard = this.captureObject.playerCard["Number"];
      let sumCard1 = this.captureObject.dealerBuildCards.map(c => c.Number).reduce((a, b) => a + b, 0);
      let sumCard2 = this.captureObject.dealerUserPile.map(c => c.Number).reduce((a, b) => a + b, 0);
      let sumCard3 = this.captureObject.tableCards.map(c => c.Number).reduce((a, b) => a + b, 0);
      sumCard = sumCard + sumCard1 + sumCard2 + sumCard3;
      let buildNUmber = this.player.UserBuild.Number;
      let cardCount = this.captureObject.dealerBuildCards.length + this.captureObject.dealerUserPile.length + this.captureObject.tableCards.length;
      if (sumCard % this.captureObject.playerCard["Number"] != 0 || cardCount < 1) {

        this.player.UserHand.push(this.captureObject.playerCard);
        this.dealer.UserBuild.Cards = this.dealer.UserBuild.Cards.concat(this.captureObject.dealerBuildCards);
        this.dealer.UserPile = this.dealer.UserPile.concat(this.captureObject.dealerUserPile);
        this.tableCards = this.tableCards.concat(this.captureObject.tableCards);

        this.cardGameService.removeItem(this.player.UserPile, this.captureObject.playerCard);
        this.player.UserPile = this.player.UserPile.filter(c => !this.captureObject.dealerBuildCards.includes(c));
        this.player.UserPile = this.player.UserPile.filter(c => !this.captureObject.dealerUserPile.includes(c));
        this.player.UserPile = this.player.UserPile.filter(c => !this.captureObject.tableCards.includes(c));
        this.gameState.playerCapture = false;
        this.gameState.playerCardSelected = false;
        this.captureObject = { playerCard: {}, tableCards: [], dealerUserPile: [], dealerBuildCards: [] };

      } else {
        this.captureObject = { playerCard: {}, tableCards: [], dealerUserPile: [], dealerBuildCards: [] };
        this.gameState.playerCapture = false;
        this.gameState.playerCardSelected = false;
        this.openTurnDialog();
      }
    }
  }

  savePlayerInfo() {

  }



}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './dialog.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
