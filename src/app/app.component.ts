import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, interval, of, Subject} from 'rxjs';
import {concatMap, delay, filter, finalize, switchMap, takeWhile, tap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'test';
  startProgress$: Subject<boolean> = new Subject<boolean>();
  startProgress2$: Subject<number> = new Subject();
  revertProgress$: Subject<void> = new Subject<void>();
  isLooped = false;
  progressWidth = 0;
  progressWidth2 = 0;
  isPaused = false;
  counter$ = new BehaviorSubject(0);
  counter = 0;

  ngOnInit(): void {
    this.startProgress$
      .pipe(
        switchMap((isUp) =>
          interval(30)
            .pipe(
              filter(() => !this.isPaused),
              takeWhile(() => this.progressWidth !== (isUp ? 100 : 0)),
              tap(i => {
                this.progressWidth = this.progressWidth + (isUp ? 1 : -1);
              }),
              finalize(() => {
                console.log('DONE!');
                if (this.isLooped) {
                  this.startProgress$.next(!isUp);
                }
              })
            )
        ),
      )
      .subscribe();

    this.startProgress2$
      .pipe(
        concatMap((val) => (val as any)
          .pipe(
            tap((time: number) => this.counter$.next(time)),
            tap(() => this.progressWidth2 += 25),
            finalize(() => console.log('Progress is', this.progressWidth2 + '%'))
          ))
      )
      .subscribe();

    this.counter$
      .pipe(
        concatMap((val) => of(val).pipe(
          tap(() => this.counter = val),
          delay(val)
        )),
      )
      .subscribe();
  }

  forward(): void {
    this.startProgress$.next(true);
  }

  back(): void {
    this.startProgress$.next(false);
  }

  loop(): void {
    this.isLooped = !this.isLooped;
  }

  pause(): void {
    this.isPaused = !this.isPaused;
  }

  start2(): void {
    [
      of(2000).pipe(delay(2000)),
      of(2000).pipe(delay(2000)),
      of(2000).pipe(delay(2000)),
      of(2000).pipe(delay(2000)),
    ].forEach((i) => this.startProgress2$.next(i as any));
  }
}
