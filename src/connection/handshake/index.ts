import Util from '../../util';
import * as Collections from '../../utils/collections';
import * as Protocol from '../protocol/protocol';
import Connection from '../connection';
import TransportConnection from "node/transport_connection";
import HandshakeResults from './handshake_results';
import HandshakePayload from './handshake_payload';

/**
 * Handles Pusher protocol handshakes for transports.
 *
 * Calls back with a result object after handshake is completed. Results
 * always have two fields:
 * - action - string describing action to be taken after the handshake
 * - transport - the transport object passed to the constructor
 *
 * Different actions can set different additional properties on the result.
 * In the case of 'connected' action, there will be a 'connection' property
 * containing a Connection object for the transport. Other actions should
 * carry an 'error' property.
 *
 * @param {AbstractTransport} transport
 * @param {Function} callback
 */
export default class Handshake {
  transport: TransportConnection;
  callback: (HandshakePayload)=>void;
  onMessage: Function;
  onClosed: Function;

  constructor(transport : TransportConnection, callback : (HandshakePayload)=>void) {
    this.transport = transport;
    this.callback = callback;
    this.bindListeners();
  }

  close() {
    this.unbindListeners();
    this.transport.close();
  }

  /** @private */
  bindListeners() {
    var self = this;

    self.onMessage = function(m) {
      self.unbindListeners();

      try {
        var result = Protocol.processHandshake(m);
        if (result.action === <any>HandshakeResults.CONNECTED) {
          self.finish("connected", {
            connection: new Connection(result.id, self.transport),
            activityTimeout: result.activityTimeout
          });
        } else {
          self.finish(result.action, { error: result.error });
          self.transport.close();
        }
      } catch (e) {
        self.finish("error", { error: e });
        self.transport.close();
      }
    };

    self.onClosed = function(closeEvent) {
      self.unbindListeners();

      var action = Protocol.getCloseAction(closeEvent) || "backoff";
      var error = Protocol.getCloseError(closeEvent);
      self.finish(action, { error: error });
    };

    self.transport.bind("message", self.onMessage);
    self.transport.bind("closed", self.onClosed);
  }

  /** @private */
  unbindListeners() {
    this.transport.unbind("message", this.onMessage);
    this.transport.unbind("closed", this.onClosed);
  }

  /** @private */
  finish(action : any, params : any) {
    this.callback(
      Collections.extend({ transport: this.transport, action: action }, params)
    );
  }

}
