import 'jigjs/core/register';
import {Renderable} from "jigjs/template/render";
import {disconnectedCallback, html, pureComponent} from "jigjs/pure-components/pure-component";
import {Subject} from "jigjs/events/subject";
import {observable, observing} from "jigjs/side-effect/observable";
import {AppFactory} from "jigjs/pure-server/ssr";
import {Routes} from "jigjs/pure-router/routes";
import {App} from "jigjs/pure-app/app";
import {RouterModule} from "jigjs/pure-router/module";


@observable()
class TestClass {
    count = 0

    increase() {
        this.count++;
    }
}

@pureComponent()
class ActionButton {
    clickSubject: Subject<void>;

    constructor(private readonly label: string) {
        this.clickSubject = new Subject();
    }

    render() {
        return html`<button onclick="${() => this.clickSubject.publish()}">${this.label}</button>`
    }
}

@pureComponent()
class ToggleWatchButton {
    public readonly pauseSubject: Subject<void>;
    public readonly resumeSubject: Subject<void>;
    @observing()
    public running = true;
    private readonly pause = new ActionButton('pause');
    private readonly resume = new ActionButton('resume');

    constructor() {
        this.pause = new ActionButton('pause');
        this.resume = new ActionButton('resume');

        this.pauseSubject = this.pause.clickSubject;
        this.resumeSubject = this.resume.clickSubject;

        this.pauseSubject.subscribe(() => {
            this.running = false;
        });

        this.resumeSubject.subscribe(() => {
            this.running = true;
        });
    }

    render() {
        if (this.running) {
            return html`${this.pause}`;
        }

        return html`${this.resume}`;
    }

    markAsRunning() {
        this.running = true;
    }
}

@pureComponent()
class Counter {
    @observing()
    private number = 0;
    private interval: any;

    constructor() {
        this.startWatcher();
    }

    render(): Renderable {
        return html`<strong>total:</strong> ${this.number}`;
    }

    public restartWatcher() {
        this.number = 0;
        this.resumeWatcher();
    }

    @disconnectedCallback()
    public pauseWatcher() {
        this.interval = clearInterval(this.interval);
    }

    public resumeWatcher() {
        if (this.interval) {
            return;
        }
        this.startWatcher();
    }

    private startWatcher() {
        this.interval = setInterval(() => {
            this.number++;
        }, 1000);
    }
}

@pureComponent()
class CountWatch {
    private readonly toggleWatchButton = new ToggleWatchButton();
    private readonly restartButton = new ActionButton('restart');
    private readonly counterComponent = new Counter();

    constructor() {
        this.toggleWatchButton.pauseSubject.subscribe(() => {
            this.counterComponent.pauseWatcher();
        });

        this.toggleWatchButton.resumeSubject.subscribe(() => {
            this.counterComponent.resumeWatcher();
        });

        this.restartButton.clickSubject.subscribe(() => {
            this.restartWatcher();
        });
    }

    render() {
        return html`
            ${this.restartButton}
            ${this.counterComponent}
            ${this.toggleWatchButton}
        `;
    }

    @disconnectedCallback()
    public x() {
        console.log('asds');
    }

    private restartWatcher() {
        this.counterComponent.restartWatcher();
        this.toggleWatchButton.markAsRunning();
    }
}

@pureComponent()
class PureComponentTest {
    @observing()
    private countWatchers = [];
    @observing()
    private input = "";

    render() {
        return html`
            <ul>${
            this.countWatchers.map((watcher) => {
                return html`<li>${watcher}</li>`
            })
        }</ul>
            
            ${this.input}
            
            <input value="${this.input}" oninput="${(event) => {
            this.input = event.target.value;
        }}">
            
            <button onclick="${() => {
            console.log('lalala');
            this.countWatchers = [...this.countWatchers, new CountWatch()]
        }}">Add Watcher</button>
            
            <button onclick="${() => {
            this.countWatchers = []
        }}">Clean All</button>
        `
    }
}

export const appFactory: AppFactory = (window) => {
    const routes = new Routes([{
        path: '/',
        name: 'home',
        handler(params, render) {
            render(new PureComponentTest())
        }
    }]);

    return new App(new RouterModule(window, routes))
}
