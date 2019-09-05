import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CrawlService } from '../services/crawl.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {
  crawlForm: FormGroup;
  corpusForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  userSubscription: Subscription;

  readonly MAX_DEPTH = 9;
  readonly MIN_DEPTH = 1;
  crawlDepth: number = 1;

  constructor(
    private formBuilder: FormBuilder,
    private crawlService: CrawlService,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef) { }

    ngOnInit() {
      this.userSubscription = this.authService.getUser().subscribe(user => {
        // Only access this page if user is an admin
        if (!user || (user && !user.isAdmin)) {
          this.router.navigate(['/']);
        }
      });

      this.crawlForm = this.formBuilder.group({
        url: ['', Validators.required]
      });

      this.corpusForm = this.formBuilder.group({
        corpusFile: [null, Validators.required]
      });
    }

    // convenience getter for easy access to form fields
    get crawlControls() { return this.crawlForm.controls; }
    get corpusControls() { return this.corpusForm.controls; }

    increaseDepth() {
      if (this.crawlDepth < this.MAX_DEPTH) {
        this.crawlDepth++;
      }
    }

    decreaseDepth() {
      if (this.crawlDepth > this.MIN_DEPTH) {
        this.crawlDepth--;
      }
    }

    onSubmitCrawl() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.crawlForm.invalid) {
        return;
      }

      this.loading = true;
      this.crawlService.crawlSite({url : this.crawlControls.url.value, depth: this.crawlDepth})
      .pipe(first())
      .subscribe((response) => {
        // Server return success
        if (response.success){
          this.crawlForm.reset();
        } else {
          window.alert(response.reason);
        }
        console.log(response);
        this.loading = false;
      },
      error => {
        this.loading = false;
      });
      this.submitted = false;
    }

    /* Courtesy of https://medium.com/@amcdnl/file-uploads-with-angular-reactive-forms-960fd0b34cb5 */
    onFileChange(event) {
      const reader = new FileReader();

      if(event.target.files && event.target.files.length) {
        const [file] = event.target.files;
        reader.readAsDataURL(file);

        reader.onload = () => {
          this.corpusForm.patchValue({
            corpusFile: reader.result
          });

          // need to run CD since file load runs outside of zone
          this.cd.markForCheck();
        };
      }
    }

    onSubmitCorpus() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.corpusForm.invalid) {
        return;
      }

      this.loading = true;
      let fileName = this.corpusForm.value.corpusFile.replace(/^.*[\\\/]/, '');
      this.crawlService.updateCorpus({name:fileName, contents: this.corpusControls.corpusFile.value})
      .pipe(first())
      .subscribe((response) => {
        // Server return success
        if (response.success){
          this.crawlForm.reset();
        } else {
          window.alert(response.reason);
        }
        console.log(response);
        this.loading = false;
      },
      error => {
        this.loading = false;
      });
      this.submitted = false;
    }

  }
