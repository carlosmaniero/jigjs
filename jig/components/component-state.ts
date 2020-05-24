import {Target} from "@abraham/reflection";

// eslint-disable-next-line @typescript-eslint/ban-types
export const createStateProxy = <T extends Object>(changeCallback: () => void) => (value: T): T => {
    for (const key in value) {
        if (value.hasOwnProperty(key) && typeof value[key] === 'object' && value[key] !== null) {
            (value as unknown)[key] = createStateProxy(changeCallback)(value[key])
        }
    }

    if (value === null || typeof value !== 'object') {
        return value;
    }

    return new Proxy(value, {
        set(target: T, p: PropertyKey, value: unknown): boolean {
            if (typeof value === 'object' || value !== null) {
                target[p] = createStateProxy(changeCallback)(value);
            } else {
                target[p] = value;
            }

            changeCallback();
            return true;
        },
        get(target: T, p: PropertyKey): unknown {
            return target[p];
        }
    });
}
export const stateMetadata = {
    getStateProperty<T extends Target>(componentInstance: T): string {
        return Reflect.getMetadata("design:type", componentInstance, "stateProperty");
    },
    setStateProperty<T extends Target>(componentInstance: T, propertyKey): void {
        Reflect.defineMetadata("design:type", propertyKey, componentInstance, "stateProperty");
    }
}
