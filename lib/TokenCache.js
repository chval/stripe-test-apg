'use strict';

class TokenCache {
    static _instance;

    static get instance() {
        if ( !this._instance ) {
            this._instance = new TokenCache();
        }

        return this._instance;
    }

    hasValidData() {
        if ( this.data ) {
            if ( this._expires && Math.floor(Date.now() / 1000) >= this._expires ) {
                this.data = undefined; // data has expired
                return false;
            }

            return true;
        }

        return false;
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
        this._expires = 0; // never expire

        if ( data.hasOwnProperty('expires_in') ) {
            this._expires = Math.floor(Date.now() / 1000) + parseInt(data.expires_in);
        }
    }
}

module.exports = TokenCache;
