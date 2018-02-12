import punt from 'punt';
import Observable from '../observable';
import interfaces from './interfaces';
import log from '../log';

/**
 * This is my attempt at building a light weight messaging protocol on top of UDP.
 * Once connected to another node, either node may be a sender or receiver.
 * Senders assign unique integers to receivers, and receivers assign their
 * own unique id to senders. The message payload contains the id that
 * the receiver assigned to the sender, so that the receiver always
 * knows who is sending it a message.
 *
 * Messages may be sent by invoking the instance.send(...) message with params:
 * id - that we (the sender) assigned to the receiver during the handshake
 * type - the (string) type/name of the message being sent
 * message - the (object) message being sent along
 **/

class Messages extends Observable {

  /**
   * Create a Messages communication channel. You may bind it to a port and interface
   * @param {Number} port - the port to bind to
   * @param {String|null} bind_interface - (optional) the interface ipv4 address to bind to, default is 0.0.0.0
   **/

  constructor(port, bind_interface = '0.0.0.0') {
    super();

    this.port = port;           // port to bind to
    this.peers = {};            // peer id to connection object
    this.peersByInterface = {}; // peer ipv4 to connection object
    this.peerCount = 0;         // count of total number of peers ever seen

    // bind on the UDP port and trigger events on all incoming messages
    log('LISTENING', `bound to port ${port}`);
    this.server = punt.bind(`${bind_interface}:${port}`);
    this.server.on('message', (message) => {
      this.trigger(message.type, message);
    });

    // bind the handshake handlers to their corresponding event names
    this.on(this, 'introduce', this._handleIntroduction.bind(this));
    this.on(this, 'connectionProbe', this._handleConnectionProbe.bind(this));
    this.on(this, 'probeReply', this._handleProbeReply.bind(this));
    this.on(this, 'assignId', this._handleAssignId.bind(this));
  }

  /**
   * Transmit a message to another node. The payload consists of the `message` being sent, the `type`
   * of event being sent, as well as the `id` that the receiving node has assigned TO US. Sending
   * their ID that they assigned to us is important so that they know which node is sending
   * them a message.
   * @param {client_id} Number - the id of the other node
   * @param {type} String - a unique if for this type of message (that the other node may listen for)
   * @param {Object} message - the payload to transmit to the other node
   * @return {void} there is no confirmation or notice upon errors
   **/

  send(client_id, type, message = {}) {
    const connection = this.peers[client_id];
    if (!connection) {
      return;
    }
    message.type = type;
    message.id = connection.inId;
    connection.send(message);
  }

  /**
   * connect to another node
   * @param {String} ip - the ipv4 address of the other node
   * @param {Number} port - the port of the other node
   * @return {Object} object representing other node
   **/

  connect(ip, port) {
    const connection = punt.connect(`${ip}:${port}`);
    this.peerCount++;
    const peer = this.peerCount;
    this.peers[peer] = connection;
    this.peersByInterface[ip] = connection;
    connection.outId = peer;
    connection.send({
      type: 'introduce',
      id: peer,
      interfaces,
      port: this.port,
    });
    log('ATTEMPT_CONNETION', `attempting connection to ${ip}:${port} assigned ID ${peer}`);
    return peer;
  }

  /**
   * This handles an incoming connection request. The requester has sent us a list of
   * all their interfaces, and port. We will send one message to each interface
   * in the hopes that we make contact with the requester. The requester
   * has also sent us `id` which is the requester's id for us. We
   * send that back too so they can identify us.
   **/

  _handleIntroduction(message) {
    log('GOT_HANDSHAKE', `introduced to ${message.interfaces.join(',')}:${message.port} who assigned me id ${message.id}`);
    message.interfaces.forEach(current_interface => {
      const connection = punt.connect(`${current_interface}:${message.port}`);
      connection.send({
        type: 'connectionProbe',
        interface: current_interface,
        id: message.id,
        port: message.port,
      });
    });
  }

  /**
   * This handler runs after we (the sender) have just sent another node a list of
   * interfaces that we might be bound to. If this fires, it means a node we
   * just tried to connect to has successfully found an interface to reach
   * us on. We mark their connection as resolved and reply with the
   * interface that made it through.
   **/

  _handleConnectionProbe(message) {
    const connection = this.peers[message.id];
    if (!connection || connection.resolved) {
      return;
    }
    log('RESOLVED_IP', `resolved my ip for ID ${message.id}`);
    connection.resolved = true;
    connection.send({
      type: 'probeReply',
      id: message.id,
      interface: message.interface,
      port: message.port,
    });
  }

  /**
   * This runs after we (the receiver) have just sent a message to each interface
   * of another node, and that node detected the message and is replying to let
   * us know which interface to use to contact them. We now have a two way
   * channel between us (the receiver) and them (the sender). We now
   * assign our own unique id to the sender, we track which id they
   * have assigned to us, and we reply to the sender with both
   * our id for them, and their id for us.
   **/

  _handleProbeReply(message) {
    log('CONNETED', `resolved ip for ${message.interface}:${message.port} who assigned me ID ${message.id}`);
    const connection = punt.connect(`${message.interface}:${message.port}`);
    let myId;
    if (this.peersByInterface[message.interface]) {
      const old_connection = this.peersByInterface[message.interface];
      connection.outId = old_connection.outId;
      this.peers[connection.outId] = connection;
      this.peersByInterface[message.interface] = connection;
      myId = connection.outId;
    } else {
      this.peerCount++;
      const peer = myId = this.peerCount;
      this.peers[peer] = connection;
      this.peersByInterface[message.interface] = connection;
      connection.outId = peer;
    }
    connection.inId = message.id;
    connection.send({
      type: 'assignId',
      myId: myId,
      id: message.id,
    });
    this.trigger('INCOMING_CONNECTION', { id: myId });
  }

  /**
   * This handler runs when another node has finished connecting to us, and has
   * assigned their own unique identifier for us. We track this id for later
   * when we want to send that node a message (so that they know who is
   * messaging them)
   **/

  _handleAssignId(message) {
    const connection = this.peers[message.id];
    if (!connection) {
      return;
    }
    log('CONNETED', `user I gave ID ${message.id} assigned me ID ${message.myId}`);
    connection.inId = message.myId;
    this.trigger('CONNECTED', { id: message.id });
  }

};

export default Messages;
