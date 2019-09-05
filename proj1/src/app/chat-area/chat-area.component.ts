import {Component, OnInit, ViewEncapsulation, ViewChildren, QueryList, ElementRef} from '@angular/core';
import { MessageService } from '../services/message.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat-area',
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.less'],

  encapsulation: ViewEncapsulation.None
})
export class ChatAreaComponent implements OnInit {

  display = false;
  addMessage = true;
  userName = '';
  messages: {header: String, content: String, isUser: boolean}[] = [];
  savedInput?: String;
  messageOptions: String[] = [];
  optionsIndex: number = 0;
  checkingOptions: boolean = false;
  isOptionsCorpus: boolean = false;
  @ViewChildren("messageListDisplay") messageListDisplay: QueryList<ElementRef>;
  userSubscription: Subscription;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      // Set the username
      if (user) {
        this.userName = user.username;
      } else {
        this.userName = 'HUMAN';
      }
    });
  }

  toggleChat() {
    this.display = !this.display;
  }

  addMessageToView(message: String, isHuman: boolean) {
    let userHeader = isHuman ? this.userName : 'BOT';
    this.messages.push({header: userHeader, content: message, isUser: isHuman});
    if (isHuman) {
      // Reset text area
      const replaceElement: HTMLInputElement = document.getElementById('message') as HTMLInputElement;
      replaceElement.value = '';
    }
  }

  scrollToBottomMessage() {
    this.messageListDisplay.changes.subscribe(() => {
      if (this.messageListDisplay && this.messageListDisplay.last) {
        this.messageListDisplay.last.nativeElement.scrollIntoView();
      }
    });
  }

  displayWatsonResponse(response): Promise<any> {
    return new Promise((resolve) => {
      if (response.response_type === 'text') {
        this.addMessageToView(response.text, false);
        this.scrollToBottomMessage();
        resolve();
      } else if (response.response_type === 'pause') {
        setTimeout(() => resolve(), response.time);
      }
    });
  }

  displayOptionsHelper() {
    this.optionsIndex++;
    if (this.optionsIndex < this.messageOptions.length) {
      if (this.optionsIndex > 1) {
        this.addMessageToView('What about this result?', false);
      }
      this.addMessageToView(this.messageOptions[this.optionsIndex], false);
      this.scrollToBottomMessage();
      setTimeout(() => {
        this.addMessageToView('Was this response helpful?', false);
        this.scrollToBottomMessage();
      }, 1300);
    } else {
      // Once we've ran out of options check the indexer
      if (this.isOptionsCorpus) {
        this.addMessageToView('Let me find more results for you...', false);
        this.scrollToBottomMessage();
        this.messageService.sendIndexerMessage(this.savedInput).subscribe(result => {
          this.indexerCallback(result, this.savedInput);
        });
      } else {
        // If we've already checked the indexer then there's nothing else
        this.checkingOptions = false;
        this.optionsIndex = 0;
        setTimeout(() => {
          this.addMessageToView('I am sorry, there is no other result for this', false);
          this.scrollToBottomMessage();
        }, 2000);
      }
    }
  }

  indexerCallback(data, input) {
    // Resolve and display indexer results
    console.log('indexer: ' + data);
    // Display corpus results
    if (!data || (data && data.body === '')) {
      this.addMessageToView('Sorry, I dont understand...', false);
      this.scrollToBottomMessage();
    } else {
      this.messageOptions = data.body.split(/[0-9]\)/);
      this.optionsIndex = 0;
      this.checkingOptions = true;
      this.isOptionsCorpus = false;
      this.displayOptionsHelper();
    }
  }

  corpusCallback(data, input) {
    console.log('corpus: ' + data);
    if (!data || (data && data.body === '')) { // If corpus gives null then make call to indexer
      this.messageService.sendIndexerMessage(input).subscribe(result => {
        this.indexerCallback(result, input);
      });
    } else {
      // Display corpus results
      this.messageOptions = data.body.split(/[0-9]\)/);
      this.optionsIndex = 0;
      this.checkingOptions = true;
      this.isOptionsCorpus = true;
      this.displayOptionsHelper();
    }
  }

  watsonCallback(data, input) {
    let contents = JSON.parse(data.body);
    let responses = contents.output.generic;
    console.log(contents);
    // If Watson give null then make a call to the corpus
    if (responses.length === 1 && responses[0].text === '0b0000') {
      this.messageService.sendCorpusMessage(input).subscribe(result => {
        this.corpusCallback(result, input);
      })
    } else {
      // Promise chain https://stackoverflow.com/questions/21372320/how-to-chain-execution-of-array-of-functions-when-every-function-returns-deferre
      let promise = this.displayWatsonResponse(responses[0]);
      for (let i = 1; i < responses.length; i++) {
        promise = promise.then(() => this.displayWatsonResponse(responses[i]));
      }
    }
  }

  sendMessage(input: string) {
    // Strip new line after message
    input = input.trim();
    if (this.addMessage) {
      // Display the user's message
      this.addMessageToView(input, true);
    }
    this.addMessage = true;
    // Scroll into view
    this.scrollToBottomMessage();
    // Send the user's message to IBM Watson first
    if (!this.checkingOptions) {
      this.savedInput = input;
      if (!this.messageService.watsonSessionId) {
        this.messageService.startWatson().subscribe(() => {
          this.messageService.sendWatsonMessage(input).subscribe(result => {
            this.watsonCallback(result, input);
          });
        });
      } else {
        this.messageService.sendWatsonMessage(input).subscribe(result => {
          this.watsonCallback(result, input);
        });
      }
    } else {
      // We're checking for options in messageOptions (multiple results from corpus/indexer)
      if (input.includes('no') || input.includes('useless') || input.includes('stupid')) {
        // Response was not helpful
        this.displayOptionsHelper();
      } else if (input.includes('yes') || input.includes('thank') || input.includes('great')) {
        // Response was helpful
        // Clear options
        this.checkingOptions = false;
        this.optionsIndex = 0;
        this.messageOptions = [];
        this.addMessageToView('Great, what else would you like to know?', false);
      } else {
        // Clear options
        this.checkingOptions = false;
        this.optionsIndex = 0;
        this.messageOptions = [];
        this.addMessage = false;
        this.sendMessage(input);
      }
    }
  }

  showMore() {
    this.displayOptionsHelper();
  }

  thatsEnough() {
    this.checkingOptions = false;
    this.optionsIndex = 0;
    this.messageOptions = [];
    this.addMessageToView('Great, what else would you like to know?', false);
  }


}
