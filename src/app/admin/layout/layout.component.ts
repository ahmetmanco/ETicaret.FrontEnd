import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuthService } from 'src/app/services/common/auth.service';
import { AppTopstripComponent } from 'src/app/layouts/full/top-strip/topstrip.component';
import { AppNavItemComponent } from 'src/app/layouts/full/sidebar/nav-item/nav-item.component';
import { HeaderComponent } from 'src/app/layouts/full/header/header.component';
import { navItems } from 'src/app/layouts/full/sidebar/sidebar-data';


const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';


@Component({
  selector: 'app-layout',
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    // SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
    AppTopstripComponent,
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {
isAuthenticated: boolean = false;
  navItems = navItems;

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  //get options from service
  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
}
 constructor(
    private settings: CoreService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
      });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
      });
  }
  private initializeSidenavState() {
  const savedState = localStorage.getItem('sidenavState');
  if (savedState) {
    const { opened, collapsed } = JSON.parse(savedState);
    this.options.sidenavOpened = opened;
    this.options.sidenavCollapsed = collapsed;
  }
}
private saveSidenavState() {
  localStorage.setItem('sidenavState', JSON.stringify({
    opened: this.options.sidenavOpened,
    collapsed: this.options.sidenavCollapsed
  }));
}

 ngOnInit() {
  this.initializeSidenavState();
  this.authService.identityCheck();
  this.authService.isAuthenticated$.subscribe(auth => {
    this.isAuthenticated = auth;
  });
}

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
  this.isContentWidthFixed = false;
  this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
  this.saveSidenavState();
  this.resetCollapsedState();
}

  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

 onSidenavOpenedChange(isOpened: boolean) {
  this.isCollapsedWidthFixed = !this.isOver;
  this.options.sidenavOpened = isOpened;
  this.saveSidenavState();
}

}