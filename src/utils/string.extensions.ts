declare global {
    interface String {
        sort(): string;
    }
}

String.prototype.sort = function (): string {
    return this.split("").sort().join("");
};

export { };