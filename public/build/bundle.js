
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics$1 = function(d, b) {
        extendStatics$1 = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics$1(d, b);
    };

    function __extends$1(d, b) {
        extendStatics$1(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign$2 = function() {
        __assign$2 = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign$2.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2317')
    var nodejsCustomInspectSymbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('nodejs.util.inspect.custom') : undefined;

    function _typeof$2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$2 = function _typeof(obj) { return typeof obj; }; } else { _typeof$2 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$2(obj); }
    var MAX_ARRAY_LENGTH = 10;
    var MAX_RECURSIVE_DEPTH = 2;
    /**
     * Used to print values in error messages.
     */

    function inspect(value) {
      return formatValue(value, []);
    }

    function formatValue(value, seenValues) {
      switch (_typeof$2(value)) {
        case 'string':
          return JSON.stringify(value);

        case 'function':
          return value.name ? "[function ".concat(value.name, "]") : '[function]';

        case 'object':
          if (value === null) {
            return 'null';
          }

          return formatObjectValue(value, seenValues);

        default:
          return String(value);
      }
    }

    function formatObjectValue(value, previouslySeenValues) {
      if (previouslySeenValues.indexOf(value) !== -1) {
        return '[Circular]';
      }

      var seenValues = [].concat(previouslySeenValues, [value]);
      var customInspectFn = getCustomFn(value);

      if (customInspectFn !== undefined) {
        var customValue = customInspectFn.call(value); // check for infinite recursion

        if (customValue !== value) {
          return typeof customValue === 'string' ? customValue : formatValue(customValue, seenValues);
        }
      } else if (Array.isArray(value)) {
        return formatArray(value, seenValues);
      }

      return formatObject(value, seenValues);
    }

    function formatObject(object, seenValues) {
      var keys = Object.keys(object);

      if (keys.length === 0) {
        return '{}';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[' + getObjectTag(object) + ']';
      }

      var properties = keys.map(function (key) {
        var value = formatValue(object[key], seenValues);
        return key + ': ' + value;
      });
      return '{ ' + properties.join(', ') + ' }';
    }

    function formatArray(array, seenValues) {
      if (array.length === 0) {
        return '[]';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[Array]';
      }

      var len = Math.min(MAX_ARRAY_LENGTH, array.length);
      var remaining = array.length - len;
      var items = [];

      for (var i = 0; i < len; ++i) {
        items.push(formatValue(array[i], seenValues));
      }

      if (remaining === 1) {
        items.push('... 1 more item');
      } else if (remaining > 1) {
        items.push("... ".concat(remaining, " more items"));
      }

      return '[' + items.join(', ') + ']';
    }

    function getCustomFn(object) {
      var customInspectFn = object[String(nodejsCustomInspectSymbol)];

      if (typeof customInspectFn === 'function') {
        return customInspectFn;
      }

      if (typeof object.inspect === 'function') {
        return object.inspect;
      }
    }

    function getObjectTag(object) {
      var tag = Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/]$/, '');

      if (tag === 'Object' && typeof object.constructor === 'function') {
        var name = object.constructor.name;

        if (typeof name === 'string' && name !== '') {
          return name;
        }
      }

      return tag;
    }

    function invariant$7(condition, message) {
      var booleanCondition = Boolean(condition); // istanbul ignore else (See transformation done in './resources/inlineInvariant.js')

      if (!booleanCondition) {
        throw new Error(message != null ? message : 'Unexpected invariant triggered.');
      }
    }

    /**
     * The `defineInspect()` function defines `inspect()` prototype method as alias of `toJSON`
     */

    function defineInspect(classObject) {
      var fn = classObject.prototype.toJSON;
      typeof fn === 'function' || invariant$7(0);
      classObject.prototype.inspect = fn; // istanbul ignore else (See: 'https://github.com/graphql/graphql-js/issues/2317')

      if (nodejsCustomInspectSymbol) {
        classObject.prototype[nodejsCustomInspectSymbol] = fn;
      }
    }

    /**
     * Contains a range of UTF-8 character offsets and token references that
     * identify the region of the source from which the AST derived.
     */
    var Location = /*#__PURE__*/function () {
      /**
       * The character offset at which this Node begins.
       */

      /**
       * The character offset at which this Node ends.
       */

      /**
       * The Token at which this Node begins.
       */

      /**
       * The Token at which this Node ends.
       */

      /**
       * The Source document the AST represents.
       */
      function Location(startToken, endToken, source) {
        this.start = startToken.start;
        this.end = endToken.end;
        this.startToken = startToken;
        this.endToken = endToken;
        this.source = source;
      }

      var _proto = Location.prototype;

      _proto.toJSON = function toJSON() {
        return {
          start: this.start,
          end: this.end
        };
      };

      return Location;
    }(); // Print a simplified form when appearing in `inspect` and `util.inspect`.

    defineInspect(Location);
    /**
     * Represents a range of characters represented by a lexical token
     * within a Source.
     */

    var Token = /*#__PURE__*/function () {
      /**
       * The kind of Token.
       */

      /**
       * The character offset at which this Node begins.
       */

      /**
       * The character offset at which this Node ends.
       */

      /**
       * The 1-indexed line number on which this Token appears.
       */

      /**
       * The 1-indexed column number at which this Token begins.
       */

      /**
       * For non-punctuation tokens, represents the interpreted value of the token.
       */

      /**
       * Tokens exist as nodes in a double-linked-list amongst all tokens
       * including ignored tokens. <SOF> is always the first node and <EOF>
       * the last.
       */
      function Token(kind, start, end, line, column, prev, value) {
        this.kind = kind;
        this.start = start;
        this.end = end;
        this.line = line;
        this.column = column;
        this.value = value;
        this.prev = prev;
        this.next = null;
      }

      var _proto2 = Token.prototype;

      _proto2.toJSON = function toJSON() {
        return {
          kind: this.kind,
          value: this.value,
          line: this.line,
          column: this.column
        };
      };

      return Token;
    }(); // Print a simplified form when appearing in `inspect` and `util.inspect`.

    defineInspect(Token);
    /**
     * @internal
     */

    function isNode(maybeNode) {
      return maybeNode != null && typeof maybeNode.kind === 'string';
    }
    /**
     * The list of all possible AST node types.
     */

    /**
     * A visitor is provided to visit, it contains the collection of
     * relevant functions to be called during the visitor's traversal.
     */

    var QueryDocumentKeys = {
      Name: [],
      Document: ['definitions'],
      OperationDefinition: ['name', 'variableDefinitions', 'directives', 'selectionSet'],
      VariableDefinition: ['variable', 'type', 'defaultValue', 'directives'],
      Variable: ['name'],
      SelectionSet: ['selections'],
      Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
      Argument: ['name', 'value'],
      FragmentSpread: ['name', 'directives'],
      InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
      FragmentDefinition: ['name', // Note: fragment variable definitions are experimental and may be changed
      // or removed in the future.
      'variableDefinitions', 'typeCondition', 'directives', 'selectionSet'],
      IntValue: [],
      FloatValue: [],
      StringValue: [],
      BooleanValue: [],
      NullValue: [],
      EnumValue: [],
      ListValue: ['values'],
      ObjectValue: ['fields'],
      ObjectField: ['name', 'value'],
      Directive: ['name', 'arguments'],
      NamedType: ['name'],
      ListType: ['type'],
      NonNullType: ['type'],
      SchemaDefinition: ['description', 'directives', 'operationTypes'],
      OperationTypeDefinition: ['type'],
      ScalarTypeDefinition: ['description', 'name', 'directives'],
      ObjectTypeDefinition: ['description', 'name', 'interfaces', 'directives', 'fields'],
      FieldDefinition: ['description', 'name', 'arguments', 'type', 'directives'],
      InputValueDefinition: ['description', 'name', 'type', 'defaultValue', 'directives'],
      InterfaceTypeDefinition: ['description', 'name', 'interfaces', 'directives', 'fields'],
      UnionTypeDefinition: ['description', 'name', 'directives', 'types'],
      EnumTypeDefinition: ['description', 'name', 'directives', 'values'],
      EnumValueDefinition: ['description', 'name', 'directives'],
      InputObjectTypeDefinition: ['description', 'name', 'directives', 'fields'],
      DirectiveDefinition: ['description', 'name', 'arguments', 'locations'],
      SchemaExtension: ['directives', 'operationTypes'],
      ScalarTypeExtension: ['name', 'directives'],
      ObjectTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
      InterfaceTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
      UnionTypeExtension: ['name', 'directives', 'types'],
      EnumTypeExtension: ['name', 'directives', 'values'],
      InputObjectTypeExtension: ['name', 'directives', 'fields']
    };
    var BREAK = Object.freeze({});
    /**
     * visit() will walk through an AST using a depth-first traversal, calling
     * the visitor's enter function at each node in the traversal, and calling the
     * leave function after visiting that node and all of its child nodes.
     *
     * By returning different values from the enter and leave functions, the
     * behavior of the visitor can be altered, including skipping over a sub-tree of
     * the AST (by returning false), editing the AST by returning a value or null
     * to remove the value, or to stop the whole traversal by returning BREAK.
     *
     * When using visit() to edit an AST, the original AST will not be modified, and
     * a new version of the AST with the changes applied will be returned from the
     * visit function.
     *
     *     const editedAST = visit(ast, {
     *       enter(node, key, parent, path, ancestors) {
     *         // @return
     *         //   undefined: no action
     *         //   false: skip visiting this node
     *         //   visitor.BREAK: stop visiting altogether
     *         //   null: delete this node
     *         //   any value: replace this node with the returned value
     *       },
     *       leave(node, key, parent, path, ancestors) {
     *         // @return
     *         //   undefined: no action
     *         //   false: no action
     *         //   visitor.BREAK: stop visiting altogether
     *         //   null: delete this node
     *         //   any value: replace this node with the returned value
     *       }
     *     });
     *
     * Alternatively to providing enter() and leave() functions, a visitor can
     * instead provide functions named the same as the kinds of AST nodes, or
     * enter/leave visitors at a named key, leading to four permutations of the
     * visitor API:
     *
     * 1) Named visitors triggered when entering a node of a specific kind.
     *
     *     visit(ast, {
     *       Kind(node) {
     *         // enter the "Kind" node
     *       }
     *     })
     *
     * 2) Named visitors that trigger upon entering and leaving a node of
     *    a specific kind.
     *
     *     visit(ast, {
     *       Kind: {
     *         enter(node) {
     *           // enter the "Kind" node
     *         }
     *         leave(node) {
     *           // leave the "Kind" node
     *         }
     *       }
     *     })
     *
     * 3) Generic visitors that trigger upon entering and leaving any node.
     *
     *     visit(ast, {
     *       enter(node) {
     *         // enter any node
     *       },
     *       leave(node) {
     *         // leave any node
     *       }
     *     })
     *
     * 4) Parallel visitors for entering and leaving nodes of a specific kind.
     *
     *     visit(ast, {
     *       enter: {
     *         Kind(node) {
     *           // enter the "Kind" node
     *         }
     *       },
     *       leave: {
     *         Kind(node) {
     *           // leave the "Kind" node
     *         }
     *       }
     *     })
     */

    function visit(root, visitor) {
      var visitorKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : QueryDocumentKeys;

      /* eslint-disable no-undef-init */
      var stack = undefined;
      var inArray = Array.isArray(root);
      var keys = [root];
      var index = -1;
      var edits = [];
      var node = undefined;
      var key = undefined;
      var parent = undefined;
      var path = [];
      var ancestors = [];
      var newRoot = root;
      /* eslint-enable no-undef-init */

      do {
        index++;
        var isLeaving = index === keys.length;
        var isEdited = isLeaving && edits.length !== 0;

        if (isLeaving) {
          key = ancestors.length === 0 ? undefined : path[path.length - 1];
          node = parent;
          parent = ancestors.pop();

          if (isEdited) {
            if (inArray) {
              node = node.slice();
            } else {
              var clone = {};

              for (var _i2 = 0, _Object$keys2 = Object.keys(node); _i2 < _Object$keys2.length; _i2++) {
                var k = _Object$keys2[_i2];
                clone[k] = node[k];
              }

              node = clone;
            }

            var editOffset = 0;

            for (var ii = 0; ii < edits.length; ii++) {
              var editKey = edits[ii][0];
              var editValue = edits[ii][1];

              if (inArray) {
                editKey -= editOffset;
              }

              if (inArray && editValue === null) {
                node.splice(editKey, 1);
                editOffset++;
              } else {
                node[editKey] = editValue;
              }
            }
          }

          index = stack.index;
          keys = stack.keys;
          edits = stack.edits;
          inArray = stack.inArray;
          stack = stack.prev;
        } else {
          key = parent ? inArray ? index : keys[index] : undefined;
          node = parent ? parent[key] : newRoot;

          if (node === null || node === undefined) {
            continue;
          }

          if (parent) {
            path.push(key);
          }
        }

        var result = void 0;

        if (!Array.isArray(node)) {
          if (!isNode(node)) {
            throw new Error("Invalid AST Node: ".concat(inspect(node), "."));
          }

          var visitFn = getVisitFn(visitor, node.kind, isLeaving);

          if (visitFn) {
            result = visitFn.call(visitor, node, key, parent, path, ancestors);

            if (result === BREAK) {
              break;
            }

            if (result === false) {
              if (!isLeaving) {
                path.pop();
                continue;
              }
            } else if (result !== undefined) {
              edits.push([key, result]);

              if (!isLeaving) {
                if (isNode(result)) {
                  node = result;
                } else {
                  path.pop();
                  continue;
                }
              }
            }
          }
        }

        if (result === undefined && isEdited) {
          edits.push([key, node]);
        }

        if (isLeaving) {
          path.pop();
        } else {
          var _visitorKeys$node$kin;

          stack = {
            inArray: inArray,
            index: index,
            keys: keys,
            edits: edits,
            prev: stack
          };
          inArray = Array.isArray(node);
          keys = inArray ? node : (_visitorKeys$node$kin = visitorKeys[node.kind]) !== null && _visitorKeys$node$kin !== void 0 ? _visitorKeys$node$kin : [];
          index = -1;
          edits = [];

          if (parent) {
            ancestors.push(parent);
          }

          parent = node;
        }
      } while (stack !== undefined);

      if (edits.length !== 0) {
        newRoot = edits[edits.length - 1][1];
      }

      return newRoot;
    }
    /**
     * Given a visitor instance, if it is leaving or not, and a node kind, return
     * the function the visitor runtime should call.
     */

    function getVisitFn(visitor, kind, isLeaving) {
      var kindVisitor = visitor[kind];

      if (kindVisitor) {
        if (!isLeaving && typeof kindVisitor === 'function') {
          // { Kind() {} }
          return kindVisitor;
        }

        var kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;

        if (typeof kindSpecificVisitor === 'function') {
          // { Kind: { enter() {}, leave() {} } }
          return kindSpecificVisitor;
        }
      } else {
        var specificVisitor = isLeaving ? visitor.leave : visitor.enter;

        if (specificVisitor) {
          if (typeof specificVisitor === 'function') {
            // { enter() {}, leave() {} }
            return specificVisitor;
          }

          var specificKindVisitor = specificVisitor[kind];

          if (typeof specificKindVisitor === 'function') {
            // { enter: { Kind() {} }, leave: { Kind() {} } }
            return specificKindVisitor;
          }
        }
      }
    }

    var genericMessage$6 = "Invariant Violation";
    var _a$9 = Object.setPrototypeOf, setPrototypeOf$6 = _a$9 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$9;
    var InvariantError$6 = /** @class */ (function (_super) {
        __extends$1(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage$6; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage$6 + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage$6;
            setPrototypeOf$6(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$6(condition, message) {
        if (!condition) {
            throw new InvariantError$6(message);
        }
    }
    function wrapConsoleMethod$6(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod$6("warn");
        invariant.error = wrapConsoleMethod$6("error");
    })(invariant$6 || (invariant$6 = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub$5 = { env: {} };
    if (typeof process === "object") {
        processStub$5 = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub$5);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    var fastJsonStableStringify = function (data, opts) {
        if (!opts) opts = {};
        if (typeof opts === 'function') opts = { cmp: opts };
        var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

        var cmp = opts.cmp && (function (f) {
            return function (node) {
                return function (a, b) {
                    var aobj = { key: a, value: node[a] };
                    var bobj = { key: b, value: node[b] };
                    return f(aobj, bobj);
                };
            };
        })(opts.cmp);

        var seen = [];
        return (function stringify (node) {
            if (node && node.toJSON && typeof node.toJSON === 'function') {
                node = node.toJSON();
            }

            if (node === undefined) return;
            if (typeof node == 'number') return isFinite(node) ? '' + node : 'null';
            if (typeof node !== 'object') return JSON.stringify(node);

            var i, out;
            if (Array.isArray(node)) {
                out = '[';
                for (i = 0; i < node.length; i++) {
                    if (i) out += ',';
                    out += stringify(node[i]) || 'null';
                }
                return out + ']';
            }

            if (node === null) return 'null';

            if (seen.indexOf(node) !== -1) {
                if (cycles) return JSON.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }

            var seenIndex = seen.push(node) - 1;
            var keys = Object.keys(node).sort(cmp && cmp(node));
            out = '';
            for (i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringify(node[key]);

                if (!value) continue;
                if (out) out += ',';
                out += JSON.stringify(key) + ':' + value;
            }
            seen.splice(seenIndex, 1);
            return '{' + out + '}';
        })(data);
    };

    var _a$8 = Object.prototype, toString$3 = _a$8.toString, hasOwnProperty$5 = _a$8.hasOwnProperty;
    var previousComparisons$1 = new Map();
    /**
     * Performs a deep equality check on two JavaScript values, tolerating cycles.
     */
    function equal$1(a, b) {
        try {
            return check$1(a, b);
        }
        finally {
            previousComparisons$1.clear();
        }
    }
    function check$1(a, b) {
        // If the two values are strictly equal, our job is easy.
        if (a === b) {
            return true;
        }
        // Object.prototype.toString returns a representation of the runtime type of
        // the given value that is considerably more precise than typeof.
        var aTag = toString$3.call(a);
        var bTag = toString$3.call(b);
        // If the runtime types of a and b are different, they could maybe be equal
        // under some interpretation of equality, but for simplicity and performance
        // we just return false instead.
        if (aTag !== bTag) {
            return false;
        }
        switch (aTag) {
            case '[object Array]':
                // Arrays are a lot like other objects, but we can cheaply compare their
                // lengths as a short-cut before comparing their elements.
                if (a.length !== b.length)
                    return false;
            // Fall through to object case...
            case '[object Object]': {
                if (previouslyCompared$1(a, b))
                    return true;
                var aKeys = Object.keys(a);
                var bKeys = Object.keys(b);
                // If `a` and `b` have a different number of enumerable keys, they
                // must be different.
                var keyCount = aKeys.length;
                if (keyCount !== bKeys.length)
                    return false;
                // Now make sure they have the same keys.
                for (var k = 0; k < keyCount; ++k) {
                    if (!hasOwnProperty$5.call(b, aKeys[k])) {
                        return false;
                    }
                }
                // Finally, check deep equality of all child properties.
                for (var k = 0; k < keyCount; ++k) {
                    var key = aKeys[k];
                    if (!check$1(a[key], b[key])) {
                        return false;
                    }
                }
                return true;
            }
            case '[object Error]':
                return a.name === b.name && a.message === b.message;
            case '[object Number]':
                // Handle NaN, which is !== itself.
                if (a !== a)
                    return b !== b;
            // Fall through to shared +a === +b case...
            case '[object Boolean]':
            case '[object Date]':
                return +a === +b;
            case '[object RegExp]':
            case '[object String]':
                return a == "" + b;
            case '[object Map]':
            case '[object Set]': {
                if (a.size !== b.size)
                    return false;
                if (previouslyCompared$1(a, b))
                    return true;
                var aIterator = a.entries();
                var isMap = aTag === '[object Map]';
                while (true) {
                    var info = aIterator.next();
                    if (info.done)
                        break;
                    // If a instanceof Set, aValue === aKey.
                    var _a = info.value, aKey = _a[0], aValue = _a[1];
                    // So this works the same way for both Set and Map.
                    if (!b.has(aKey)) {
                        return false;
                    }
                    // However, we care about deep equality of values only when dealing
                    // with Map structures.
                    if (isMap && !check$1(aValue, b.get(aKey))) {
                        return false;
                    }
                }
                return true;
            }
        }
        // Otherwise the values are not equal.
        return false;
    }
    function previouslyCompared$1(a, b) {
        // Though cyclic references can make an object graph appear infinite from the
        // perspective of a depth-first traversal, the graph still contains a finite
        // number of distinct object references. We use the previousComparisons cache
        // to avoid comparing the same pair of object references more than once, which
        // guarantees termination (even if we end up comparing every object in one
        // graph to every object in the other graph, which is extremely unlikely),
        // while still allowing weird isomorphic structures (like rings with different
        // lengths) a chance to pass the equality test.
        var bSet = previousComparisons$1.get(a);
        if (bSet) {
            // Return true here because we can be sure false will be returned somewhere
            // else if the objects are not equivalent.
            if (bSet.has(b))
                return true;
        }
        else {
            previousComparisons$1.set(a, bSet = new Set);
        }
        bSet.add(b);
        return false;
    }

    function isStringValue$1(value) {
        return value.kind === 'StringValue';
    }
    function isBooleanValue$1(value) {
        return value.kind === 'BooleanValue';
    }
    function isIntValue$1(value) {
        return value.kind === 'IntValue';
    }
    function isFloatValue$1(value) {
        return value.kind === 'FloatValue';
    }
    function isVariable$1(value) {
        return value.kind === 'Variable';
    }
    function isObjectValue$1(value) {
        return value.kind === 'ObjectValue';
    }
    function isListValue$1(value) {
        return value.kind === 'ListValue';
    }
    function isEnumValue$1(value) {
        return value.kind === 'EnumValue';
    }
    function isNullValue$1(value) {
        return value.kind === 'NullValue';
    }
    function valueToObjectRepresentation$1(argObj, name, value, variables) {
        if (isIntValue$1(value) || isFloatValue$1(value)) {
            argObj[name.value] = Number(value.value);
        }
        else if (isBooleanValue$1(value) || isStringValue$1(value)) {
            argObj[name.value] = value.value;
        }
        else if (isObjectValue$1(value)) {
            var nestedArgObj_1 = {};
            value.fields.map(function (obj) {
                return valueToObjectRepresentation$1(nestedArgObj_1, obj.name, obj.value, variables);
            });
            argObj[name.value] = nestedArgObj_1;
        }
        else if (isVariable$1(value)) {
            var variableValue = (variables || {})[value.name.value];
            argObj[name.value] = variableValue;
        }
        else if (isListValue$1(value)) {
            argObj[name.value] = value.values.map(function (listValue) {
                var nestedArgArrayObj = {};
                valueToObjectRepresentation$1(nestedArgArrayObj, name, listValue, variables);
                return nestedArgArrayObj[name.value];
            });
        }
        else if (isEnumValue$1(value)) {
            argObj[name.value] = value.value;
        }
        else if (isNullValue$1(value)) {
            argObj[name.value] = null;
        }
        else {
            throw process.env.NODE_ENV === "production" ? new InvariantError$6(17) : new InvariantError$6("The inline argument \"" + name.value + "\" of kind \"" + value.kind + "\"" +
                'is not supported. Use variables instead of inline arguments to ' +
                'overcome this limitation.');
        }
    }
    function storeKeyNameFromField$1(field, variables) {
        var directivesObj = null;
        if (field.directives) {
            directivesObj = {};
            field.directives.forEach(function (directive) {
                directivesObj[directive.name.value] = {};
                if (directive.arguments) {
                    directive.arguments.forEach(function (_a) {
                        var name = _a.name, value = _a.value;
                        return valueToObjectRepresentation$1(directivesObj[directive.name.value], name, value, variables);
                    });
                }
            });
        }
        var argObj = null;
        if (field.arguments && field.arguments.length) {
            argObj = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation$1(argObj, name, value, variables);
            });
        }
        return getStoreKeyName$1(field.name.value, argObj, directivesObj);
    }
    var KNOWN_DIRECTIVES$1 = [
        'connection',
        'include',
        'skip',
        'client',
        'rest',
        'export',
    ];
    function getStoreKeyName$1(fieldName, args, directives) {
        if (directives &&
            directives['connection'] &&
            directives['connection']['key']) {
            if (directives['connection']['filter'] &&
                directives['connection']['filter'].length > 0) {
                var filterKeys = directives['connection']['filter']
                    ? directives['connection']['filter']
                    : [];
                filterKeys.sort();
                var queryArgs_1 = args;
                var filteredArgs_1 = {};
                filterKeys.forEach(function (key) {
                    filteredArgs_1[key] = queryArgs_1[key];
                });
                return directives['connection']['key'] + "(" + JSON.stringify(filteredArgs_1) + ")";
            }
            else {
                return directives['connection']['key'];
            }
        }
        var completeFieldName = fieldName;
        if (args) {
            var stringifiedArgs = fastJsonStableStringify(args);
            completeFieldName += "(" + stringifiedArgs + ")";
        }
        if (directives) {
            Object.keys(directives).forEach(function (key) {
                if (KNOWN_DIRECTIVES$1.indexOf(key) !== -1)
                    return;
                if (directives[key] && Object.keys(directives[key]).length) {
                    completeFieldName += "@" + key + "(" + JSON.stringify(directives[key]) + ")";
                }
                else {
                    completeFieldName += "@" + key;
                }
            });
        }
        return completeFieldName;
    }
    function argumentsObjectFromField$1(field, variables) {
        if (field.arguments && field.arguments.length) {
            var argObj_1 = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation$1(argObj_1, name, value, variables);
            });
            return argObj_1;
        }
        return null;
    }
    function resultKeyNameFromField$1(field) {
        return field.alias ? field.alias.value : field.name.value;
    }
    function isField$1(selection) {
        return selection.kind === 'Field';
    }
    function isInlineFragment(selection) {
        return selection.kind === 'InlineFragment';
    }
    function isIdValue(idObject) {
        return idObject &&
            idObject.type === 'id' &&
            typeof idObject.generated === 'boolean';
    }
    function toIdValue(idConfig, generated) {
        if (generated === void 0) { generated = false; }
        return __assign$2({ type: 'id', generated: generated }, (typeof idConfig === 'string'
            ? { id: idConfig, typename: undefined }
            : idConfig));
    }
    function isJsonValue(jsonObject) {
        return (jsonObject != null &&
            typeof jsonObject === 'object' &&
            jsonObject.type === 'json');
    }

    function getDirectiveInfoFromField(field, variables) {
        if (field.directives && field.directives.length) {
            var directiveObj_1 = {};
            field.directives.forEach(function (directive) {
                directiveObj_1[directive.name.value] = argumentsObjectFromField$1(directive, variables);
            });
            return directiveObj_1;
        }
        return null;
    }
    function shouldInclude$1(selection, variables) {
        if (variables === void 0) { variables = {}; }
        return getInclusionDirectives$1(selection.directives).every(function (_a) {
            var directive = _a.directive, ifArgument = _a.ifArgument;
            var evaledValue = false;
            if (ifArgument.value.kind === 'Variable') {
                evaledValue = variables[ifArgument.value.name.value];
                process.env.NODE_ENV === "production" ? invariant$6(evaledValue !== void 0, 13) : invariant$6(evaledValue !== void 0, "Invalid variable referenced in @" + directive.name.value + " directive.");
            }
            else {
                evaledValue = ifArgument.value.value;
            }
            return directive.name.value === 'skip' ? !evaledValue : evaledValue;
        });
    }
    function getDirectiveNames$1(doc) {
        var names = [];
        visit(doc, {
            Directive: function (node) {
                names.push(node.name.value);
            },
        });
        return names;
    }
    function hasDirectives$1(names, doc) {
        return getDirectiveNames$1(doc).some(function (name) { return names.indexOf(name) > -1; });
    }
    function hasClientExports(document) {
        return (document &&
            hasDirectives$1(['client'], document) &&
            hasDirectives$1(['export'], document));
    }
    function isInclusionDirective$1(_a) {
        var value = _a.name.value;
        return value === 'skip' || value === 'include';
    }
    function getInclusionDirectives$1(directives) {
        return directives ? directives.filter(isInclusionDirective$1).map(function (directive) {
            var directiveArguments = directive.arguments;
            var directiveName = directive.name.value;
            process.env.NODE_ENV === "production" ? invariant$6(directiveArguments && directiveArguments.length === 1, 14) : invariant$6(directiveArguments && directiveArguments.length === 1, "Incorrect number of arguments for the @" + directiveName + " directive.");
            var ifArgument = directiveArguments[0];
            process.env.NODE_ENV === "production" ? invariant$6(ifArgument.name && ifArgument.name.value === 'if', 15) : invariant$6(ifArgument.name && ifArgument.name.value === 'if', "Invalid argument for the @" + directiveName + " directive.");
            var ifValue = ifArgument.value;
            process.env.NODE_ENV === "production" ? invariant$6(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 16) : invariant$6(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), "Argument for the @" + directiveName + " directive must be a variable or a boolean value.");
            return { directive: directive, ifArgument: ifArgument };
        }) : [];
    }

    function getFragmentQueryDocument$1(document, fragmentName) {
        var actualFragmentName = fragmentName;
        var fragments = [];
        document.definitions.forEach(function (definition) {
            if (definition.kind === 'OperationDefinition') {
                throw process.env.NODE_ENV === "production" ? new InvariantError$6(11) : new InvariantError$6("Found a " + definition.operation + " operation" + (definition.name ? " named '" + definition.name.value + "'" : '') + ". " +
                    'No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            }
            if (definition.kind === 'FragmentDefinition') {
                fragments.push(definition);
            }
        });
        if (typeof actualFragmentName === 'undefined') {
            process.env.NODE_ENV === "production" ? invariant$6(fragments.length === 1, 12) : invariant$6(fragments.length === 1, "Found " + fragments.length + " fragments. `fragmentName` must be provided when there is not exactly 1 fragment.");
            actualFragmentName = fragments[0].name.value;
        }
        var query = __assign$2(__assign$2({}, document), { definitions: __spreadArrays([
                {
                    kind: 'OperationDefinition',
                    operation: 'query',
                    selectionSet: {
                        kind: 'SelectionSet',
                        selections: [
                            {
                                kind: 'FragmentSpread',
                                name: {
                                    kind: 'Name',
                                    value: actualFragmentName,
                                },
                            },
                        ],
                    },
                }
            ], document.definitions) });
        return query;
    }

    function assign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            if (typeof source === 'undefined' || source === null) {
                return;
            }
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        });
        return target;
    }
    function checkDocument$1(doc) {
        process.env.NODE_ENV === "production" ? invariant$6(doc && doc.kind === 'Document', 2) : invariant$6(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
        var operations = doc.definitions
            .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
            .map(function (definition) {
            if (definition.kind !== 'OperationDefinition') {
                throw process.env.NODE_ENV === "production" ? new InvariantError$6(3) : new InvariantError$6("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
            }
            return definition;
        });
        process.env.NODE_ENV === "production" ? invariant$6(operations.length <= 1, 4) : invariant$6(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
        return doc;
    }
    function getOperationDefinition$1(doc) {
        checkDocument$1(doc);
        return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
    }
    function getOperationName$1(doc) {
        return (doc.definitions
            .filter(function (definition) {
            return definition.kind === 'OperationDefinition' && definition.name;
        })
            .map(function (x) { return x.name.value; })[0] || null);
    }
    function getFragmentDefinitions$1(doc) {
        return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
    }
    function getQueryDefinition$1(doc) {
        var queryDef = getOperationDefinition$1(doc);
        process.env.NODE_ENV === "production" ? invariant$6(queryDef && queryDef.operation === 'query', 6) : invariant$6(queryDef && queryDef.operation === 'query', 'Must contain a query definition.');
        return queryDef;
    }
    function getFragmentDefinition(doc) {
        process.env.NODE_ENV === "production" ? invariant$6(doc.kind === 'Document', 7) : invariant$6(doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
        process.env.NODE_ENV === "production" ? invariant$6(doc.definitions.length <= 1, 8) : invariant$6(doc.definitions.length <= 1, 'Fragment must have exactly one definition.');
        var fragmentDef = doc.definitions[0];
        process.env.NODE_ENV === "production" ? invariant$6(fragmentDef.kind === 'FragmentDefinition', 9) : invariant$6(fragmentDef.kind === 'FragmentDefinition', 'Must be a fragment definition.');
        return fragmentDef;
    }
    function getMainDefinition$1(queryDoc) {
        checkDocument$1(queryDoc);
        var fragmentDefinition;
        for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
            var definition = _a[_i];
            if (definition.kind === 'OperationDefinition') {
                var operation = definition.operation;
                if (operation === 'query' ||
                    operation === 'mutation' ||
                    operation === 'subscription') {
                    return definition;
                }
            }
            if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
                fragmentDefinition = definition;
            }
        }
        if (fragmentDefinition) {
            return fragmentDefinition;
        }
        throw process.env.NODE_ENV === "production" ? new InvariantError$6(10) : new InvariantError$6('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
    }
    function createFragmentMap$1(fragments) {
        if (fragments === void 0) { fragments = []; }
        var symTable = {};
        fragments.forEach(function (fragment) {
            symTable[fragment.name.value] = fragment;
        });
        return symTable;
    }
    function getDefaultValues$1(definition) {
        if (definition &&
            definition.variableDefinitions &&
            definition.variableDefinitions.length) {
            var defaultValues = definition.variableDefinitions
                .filter(function (_a) {
                var defaultValue = _a.defaultValue;
                return defaultValue;
            })
                .map(function (_a) {
                var variable = _a.variable, defaultValue = _a.defaultValue;
                var defaultValueObj = {};
                valueToObjectRepresentation$1(defaultValueObj, variable.name, defaultValue);
                return defaultValueObj;
            });
            return assign.apply(void 0, __spreadArrays([{}], defaultValues));
        }
        return {};
    }

    function filterInPlace(array, test, context) {
        var target = 0;
        array.forEach(function (elem, i) {
            if (test.call(this, elem, i, array)) {
                array[target++] = elem;
            }
        }, context);
        array.length = target;
        return array;
    }

    var TYPENAME_FIELD$1 = {
        kind: 'Field',
        name: {
            kind: 'Name',
            value: '__typename',
        },
    };
    function isEmpty(op, fragments) {
        return op.selectionSet.selections.every(function (selection) {
            return selection.kind === 'FragmentSpread' &&
                isEmpty(fragments[selection.name.value], fragments);
        });
    }
    function nullIfDocIsEmpty(doc) {
        return isEmpty(getOperationDefinition$1(doc) || getFragmentDefinition(doc), createFragmentMap$1(getFragmentDefinitions$1(doc)))
            ? null
            : doc;
    }
    function getDirectiveMatcher(directives) {
        return function directiveMatcher(directive) {
            return directives.some(function (dir) {
                return (dir.name && dir.name === directive.name.value) ||
                    (dir.test && dir.test(directive));
            });
        };
    }
    function removeDirectivesFromDocument(directives, doc) {
        var variablesInUse = Object.create(null);
        var variablesToRemove = [];
        var fragmentSpreadsInUse = Object.create(null);
        var fragmentSpreadsToRemove = [];
        var modifiedDoc = nullIfDocIsEmpty(visit(doc, {
            Variable: {
                enter: function (node, _key, parent) {
                    if (parent.kind !== 'VariableDefinition') {
                        variablesInUse[node.name.value] = true;
                    }
                },
            },
            Field: {
                enter: function (node) {
                    if (directives && node.directives) {
                        var shouldRemoveField = directives.some(function (directive) { return directive.remove; });
                        if (shouldRemoveField &&
                            node.directives &&
                            node.directives.some(getDirectiveMatcher(directives))) {
                            if (node.arguments) {
                                node.arguments.forEach(function (arg) {
                                    if (arg.value.kind === 'Variable') {
                                        variablesToRemove.push({
                                            name: arg.value.name.value,
                                        });
                                    }
                                });
                            }
                            if (node.selectionSet) {
                                getAllFragmentSpreadsFromSelectionSet(node.selectionSet).forEach(function (frag) {
                                    fragmentSpreadsToRemove.push({
                                        name: frag.name.value,
                                    });
                                });
                            }
                            return null;
                        }
                    }
                },
            },
            FragmentSpread: {
                enter: function (node) {
                    fragmentSpreadsInUse[node.name.value] = true;
                },
            },
            Directive: {
                enter: function (node) {
                    if (getDirectiveMatcher(directives)(node)) {
                        return null;
                    }
                },
            },
        }));
        if (modifiedDoc &&
            filterInPlace(variablesToRemove, function (v) { return !variablesInUse[v.name]; }).length) {
            modifiedDoc = removeArgumentsFromDocument(variablesToRemove, modifiedDoc);
        }
        if (modifiedDoc &&
            filterInPlace(fragmentSpreadsToRemove, function (fs) { return !fragmentSpreadsInUse[fs.name]; })
                .length) {
            modifiedDoc = removeFragmentSpreadFromDocument(fragmentSpreadsToRemove, modifiedDoc);
        }
        return modifiedDoc;
    }
    function addTypenameToDocument$1(doc) {
        return visit(checkDocument$1(doc), {
            SelectionSet: {
                enter: function (node, _key, parent) {
                    if (parent &&
                        parent.kind === 'OperationDefinition') {
                        return;
                    }
                    var selections = node.selections;
                    if (!selections) {
                        return;
                    }
                    var skip = selections.some(function (selection) {
                        return (isField$1(selection) &&
                            (selection.name.value === '__typename' ||
                                selection.name.value.lastIndexOf('__', 0) === 0));
                    });
                    if (skip) {
                        return;
                    }
                    var field = parent;
                    if (isField$1(field) &&
                        field.directives &&
                        field.directives.some(function (d) { return d.name.value === 'export'; })) {
                        return;
                    }
                    return __assign$2(__assign$2({}, node), { selections: __spreadArrays(selections, [TYPENAME_FIELD$1]) });
                },
            },
        });
    }
    var connectionRemoveConfig = {
        test: function (directive) {
            var willRemove = directive.name.value === 'connection';
            if (willRemove) {
                if (!directive.arguments ||
                    !directive.arguments.some(function (arg) { return arg.name.value === 'key'; })) {
                    process.env.NODE_ENV === "production" || invariant$6.warn('Removing an @connection directive even though it does not have a key. ' +
                        'You may want to use the key parameter to specify a store key.');
                }
            }
            return willRemove;
        },
    };
    function removeConnectionDirectiveFromDocument(doc) {
        return removeDirectivesFromDocument([connectionRemoveConfig], checkDocument$1(doc));
    }
    function getArgumentMatcher(config) {
        return function argumentMatcher(argument) {
            return config.some(function (aConfig) {
                return argument.value &&
                    argument.value.kind === 'Variable' &&
                    argument.value.name &&
                    (aConfig.name === argument.value.name.value ||
                        (aConfig.test && aConfig.test(argument)));
            });
        };
    }
    function removeArgumentsFromDocument(config, doc) {
        var argMatcher = getArgumentMatcher(config);
        return nullIfDocIsEmpty(visit(doc, {
            OperationDefinition: {
                enter: function (node) {
                    return __assign$2(__assign$2({}, node), { variableDefinitions: node.variableDefinitions.filter(function (varDef) {
                            return !config.some(function (arg) { return arg.name === varDef.variable.name.value; });
                        }) });
                },
            },
            Field: {
                enter: function (node) {
                    var shouldRemoveField = config.some(function (argConfig) { return argConfig.remove; });
                    if (shouldRemoveField) {
                        var argMatchCount_1 = 0;
                        node.arguments.forEach(function (arg) {
                            if (argMatcher(arg)) {
                                argMatchCount_1 += 1;
                            }
                        });
                        if (argMatchCount_1 === 1) {
                            return null;
                        }
                    }
                },
            },
            Argument: {
                enter: function (node) {
                    if (argMatcher(node)) {
                        return null;
                    }
                },
            },
        }));
    }
    function removeFragmentSpreadFromDocument(config, doc) {
        function enter(node) {
            if (config.some(function (def) { return def.name === node.name.value; })) {
                return null;
            }
        }
        return nullIfDocIsEmpty(visit(doc, {
            FragmentSpread: { enter: enter },
            FragmentDefinition: { enter: enter },
        }));
    }
    function getAllFragmentSpreadsFromSelectionSet(selectionSet) {
        var allFragments = [];
        selectionSet.selections.forEach(function (selection) {
            if ((isField$1(selection) || isInlineFragment(selection)) &&
                selection.selectionSet) {
                getAllFragmentSpreadsFromSelectionSet(selection.selectionSet).forEach(function (frag) { return allFragments.push(frag); });
            }
            else if (selection.kind === 'FragmentSpread') {
                allFragments.push(selection);
            }
        });
        return allFragments;
    }
    function buildQueryFromSelectionSet(document) {
        var definition = getMainDefinition$1(document);
        var definitionOperation = definition.operation;
        if (definitionOperation === 'query') {
            return document;
        }
        var modifiedDoc = visit(document, {
            OperationDefinition: {
                enter: function (node) {
                    return __assign$2(__assign$2({}, node), { operation: 'query' });
                },
            },
        });
        return modifiedDoc;
    }
    function removeClientSetsFromDocument(document) {
        checkDocument$1(document);
        var modifiedDoc = removeDirectivesFromDocument([
            {
                test: function (directive) { return directive.name.value === 'client'; },
                remove: true,
            },
        ], document);
        if (modifiedDoc) {
            modifiedDoc = visit(modifiedDoc, {
                FragmentDefinition: {
                    enter: function (node) {
                        if (node.selectionSet) {
                            var isTypenameOnly = node.selectionSet.selections.every(function (selection) {
                                return isField$1(selection) && selection.name.value === '__typename';
                            });
                            if (isTypenameOnly) {
                                return null;
                            }
                        }
                    },
                },
            });
        }
        return modifiedDoc;
    }

    var canUseWeakMap$1 = typeof WeakMap === 'function' && !(typeof navigator === 'object' &&
        navigator.product === 'ReactNative');

    var toString$2 = Object.prototype.toString;
    function cloneDeep$1(value) {
        return cloneDeepHelper$1(value, new Map());
    }
    function cloneDeepHelper$1(val, seen) {
        switch (toString$2.call(val)) {
            case "[object Array]": {
                if (seen.has(val))
                    return seen.get(val);
                var copy_1 = val.slice(0);
                seen.set(val, copy_1);
                copy_1.forEach(function (child, i) {
                    copy_1[i] = cloneDeepHelper$1(child, seen);
                });
                return copy_1;
            }
            case "[object Object]": {
                if (seen.has(val))
                    return seen.get(val);
                var copy_2 = Object.create(Object.getPrototypeOf(val));
                seen.set(val, copy_2);
                Object.keys(val).forEach(function (key) {
                    copy_2[key] = cloneDeepHelper$1(val[key], seen);
                });
                return copy_2;
            }
            default:
                return val;
        }
    }

    function getEnv$1() {
        if (typeof process !== 'undefined' && process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        return 'development';
    }
    function isEnv$1(env) {
        return getEnv$1() === env;
    }
    function isProduction() {
        return isEnv$1('production') === true;
    }
    function isDevelopment$1() {
        return isEnv$1('development') === true;
    }
    function isTest$1() {
        return isEnv$1('test') === true;
    }

    function tryFunctionOrLogError(f) {
        try {
            return f();
        }
        catch (e) {
            if (console.error) {
                console.error(e);
            }
        }
    }
    function graphQLResultHasError(result) {
        return result.errors && result.errors.length;
    }

    function deepFreeze$1(o) {
        Object.freeze(o);
        Object.getOwnPropertyNames(o).forEach(function (prop) {
            if (o[prop] !== null &&
                (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
                !Object.isFrozen(o[prop])) {
                deepFreeze$1(o[prop]);
            }
        });
        return o;
    }
    function maybeDeepFreeze$1(obj) {
        if (isDevelopment$1() || isTest$1()) {
            var symbolIsPolyfilled = typeof Symbol === 'function' && typeof Symbol('') === 'string';
            if (!symbolIsPolyfilled) {
                return deepFreeze$1(obj);
            }
        }
        return obj;
    }

    var hasOwnProperty$4 = Object.prototype.hasOwnProperty;
    function mergeDeep() {
        var sources = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sources[_i] = arguments[_i];
        }
        return mergeDeepArray$1(sources);
    }
    function mergeDeepArray$1(sources) {
        var target = sources[0] || {};
        var count = sources.length;
        if (count > 1) {
            var pastCopies = [];
            target = shallowCopyForMerge(target, pastCopies);
            for (var i = 1; i < count; ++i) {
                target = mergeHelper(target, sources[i], pastCopies);
            }
        }
        return target;
    }
    function isObject$2(obj) {
        return obj !== null && typeof obj === 'object';
    }
    function mergeHelper(target, source, pastCopies) {
        if (isObject$2(source) && isObject$2(target)) {
            if (Object.isExtensible && !Object.isExtensible(target)) {
                target = shallowCopyForMerge(target, pastCopies);
            }
            Object.keys(source).forEach(function (sourceKey) {
                var sourceValue = source[sourceKey];
                if (hasOwnProperty$4.call(target, sourceKey)) {
                    var targetValue = target[sourceKey];
                    if (sourceValue !== targetValue) {
                        target[sourceKey] = mergeHelper(shallowCopyForMerge(targetValue, pastCopies), sourceValue, pastCopies);
                    }
                }
                else {
                    target[sourceKey] = sourceValue;
                }
            });
            return target;
        }
        return source;
    }
    function shallowCopyForMerge(value, pastCopies) {
        if (value !== null &&
            typeof value === 'object' &&
            pastCopies.indexOf(value) < 0) {
            if (Array.isArray(value)) {
                value = value.slice(0);
            }
            else {
                value = __assign$2({ __proto__: Object.getPrototypeOf(value) }, value);
            }
            pastCopies.push(value);
        }
        return value;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var Observable_1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Observable = void 0;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    // === Symbol Support ===
    var hasSymbols = function () {
      return typeof Symbol === 'function';
    };

    var hasSymbol = function (name) {
      return hasSymbols() && Boolean(Symbol[name]);
    };

    var getSymbol = function (name) {
      return hasSymbol(name) ? Symbol[name] : '@@' + name;
    };

    if (hasSymbols() && !hasSymbol('observable')) {
      Symbol.observable = Symbol('observable');
    }

    var SymbolIterator = getSymbol('iterator');
    var SymbolObservable = getSymbol('observable');
    var SymbolSpecies = getSymbol('species'); // === Abstract Operations ===

    function getMethod(obj, key) {
      var value = obj[key];
      if (value == null) return undefined;
      if (typeof value !== 'function') throw new TypeError(value + ' is not a function');
      return value;
    }

    function getSpecies(obj) {
      var ctor = obj.constructor;

      if (ctor !== undefined) {
        ctor = ctor[SymbolSpecies];

        if (ctor === null) {
          ctor = undefined;
        }
      }

      return ctor !== undefined ? ctor : Observable;
    }

    function isObservable(x) {
      return x instanceof Observable; // SPEC: Brand check
    }

    function hostReportError(e) {
      if (hostReportError.log) {
        hostReportError.log(e);
      } else {
        setTimeout(function () {
          throw e;
        });
      }
    }

    function enqueue(fn) {
      Promise.resolve().then(function () {
        try {
          fn();
        } catch (e) {
          hostReportError(e);
        }
      });
    }

    function cleanupSubscription(subscription) {
      var cleanup = subscription._cleanup;
      if (cleanup === undefined) return;
      subscription._cleanup = undefined;

      if (!cleanup) {
        return;
      }

      try {
        if (typeof cleanup === 'function') {
          cleanup();
        } else {
          var unsubscribe = getMethod(cleanup, 'unsubscribe');

          if (unsubscribe) {
            unsubscribe.call(cleanup);
          }
        }
      } catch (e) {
        hostReportError(e);
      }
    }

    function closeSubscription(subscription) {
      subscription._observer = undefined;
      subscription._queue = undefined;
      subscription._state = 'closed';
    }

    function flushSubscription(subscription) {
      var queue = subscription._queue;

      if (!queue) {
        return;
      }

      subscription._queue = undefined;
      subscription._state = 'ready';

      for (var i = 0; i < queue.length; ++i) {
        notifySubscription(subscription, queue[i].type, queue[i].value);
        if (subscription._state === 'closed') break;
      }
    }

    function notifySubscription(subscription, type, value) {
      subscription._state = 'running';
      var observer = subscription._observer;

      try {
        var m = getMethod(observer, type);

        switch (type) {
          case 'next':
            if (m) m.call(observer, value);
            break;

          case 'error':
            closeSubscription(subscription);
            if (m) m.call(observer, value);else throw value;
            break;

          case 'complete':
            closeSubscription(subscription);
            if (m) m.call(observer);
            break;
        }
      } catch (e) {
        hostReportError(e);
      }

      if (subscription._state === 'closed') cleanupSubscription(subscription);else if (subscription._state === 'running') subscription._state = 'ready';
    }

    function onNotify(subscription, type, value) {
      if (subscription._state === 'closed') return;

      if (subscription._state === 'buffering') {
        subscription._queue.push({
          type: type,
          value: value
        });

        return;
      }

      if (subscription._state !== 'ready') {
        subscription._state = 'buffering';
        subscription._queue = [{
          type: type,
          value: value
        }];
        enqueue(function () {
          return flushSubscription(subscription);
        });
        return;
      }

      notifySubscription(subscription, type, value);
    }

    var Subscription =
    /*#__PURE__*/
    function () {
      function Subscription(observer, subscriber) {
        _classCallCheck(this, Subscription);

        // ASSERT: observer is an object
        // ASSERT: subscriber is callable
        this._cleanup = undefined;
        this._observer = observer;
        this._queue = undefined;
        this._state = 'initializing';
        var subscriptionObserver = new SubscriptionObserver(this);

        try {
          this._cleanup = subscriber.call(undefined, subscriptionObserver);
        } catch (e) {
          subscriptionObserver.error(e);
        }

        if (this._state === 'initializing') this._state = 'ready';
      }

      _createClass(Subscription, [{
        key: "unsubscribe",
        value: function unsubscribe() {
          if (this._state !== 'closed') {
            closeSubscription(this);
            cleanupSubscription(this);
          }
        }
      }, {
        key: "closed",
        get: function () {
          return this._state === 'closed';
        }
      }]);

      return Subscription;
    }();

    var SubscriptionObserver =
    /*#__PURE__*/
    function () {
      function SubscriptionObserver(subscription) {
        _classCallCheck(this, SubscriptionObserver);

        this._subscription = subscription;
      }

      _createClass(SubscriptionObserver, [{
        key: "next",
        value: function next(value) {
          onNotify(this._subscription, 'next', value);
        }
      }, {
        key: "error",
        value: function error(value) {
          onNotify(this._subscription, 'error', value);
        }
      }, {
        key: "complete",
        value: function complete() {
          onNotify(this._subscription, 'complete');
        }
      }, {
        key: "closed",
        get: function () {
          return this._subscription._state === 'closed';
        }
      }]);

      return SubscriptionObserver;
    }();

    var Observable =
    /*#__PURE__*/
    function () {
      function Observable(subscriber) {
        _classCallCheck(this, Observable);

        if (!(this instanceof Observable)) throw new TypeError('Observable cannot be called as a function');
        if (typeof subscriber !== 'function') throw new TypeError('Observable initializer must be a function');
        this._subscriber = subscriber;
      }

      _createClass(Observable, [{
        key: "subscribe",
        value: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            observer = {
              next: observer,
              error: arguments[1],
              complete: arguments[2]
            };
          }

          return new Subscription(observer, this._subscriber);
        }
      }, {
        key: "forEach",
        value: function forEach(fn) {
          var _this = this;

          return new Promise(function (resolve, reject) {
            if (typeof fn !== 'function') {
              reject(new TypeError(fn + ' is not a function'));
              return;
            }

            function done() {
              subscription.unsubscribe();
              resolve();
            }

            var subscription = _this.subscribe({
              next: function (value) {
                try {
                  fn(value, done);
                } catch (e) {
                  reject(e);
                  subscription.unsubscribe();
                }
              },
              error: reject,
              complete: resolve
            });
          });
        }
      }, {
        key: "map",
        value: function map(fn) {
          var _this2 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          return new C(function (observer) {
            return _this2.subscribe({
              next: function (value) {
                try {
                  value = fn(value);
                } catch (e) {
                  return observer.error(e);
                }

                observer.next(value);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                observer.complete();
              }
            });
          });
        }
      }, {
        key: "filter",
        value: function filter(fn) {
          var _this3 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          return new C(function (observer) {
            return _this3.subscribe({
              next: function (value) {
                try {
                  if (!fn(value)) return;
                } catch (e) {
                  return observer.error(e);
                }

                observer.next(value);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                observer.complete();
              }
            });
          });
        }
      }, {
        key: "reduce",
        value: function reduce(fn) {
          var _this4 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          var hasSeed = arguments.length > 1;
          var hasValue = false;
          var seed = arguments[1];
          var acc = seed;
          return new C(function (observer) {
            return _this4.subscribe({
              next: function (value) {
                var first = !hasValue;
                hasValue = true;

                if (!first || hasSeed) {
                  try {
                    acc = fn(acc, value);
                  } catch (e) {
                    return observer.error(e);
                  }
                } else {
                  acc = value;
                }
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                if (!hasValue && !hasSeed) return observer.error(new TypeError('Cannot reduce an empty sequence'));
                observer.next(acc);
                observer.complete();
              }
            });
          });
        }
      }, {
        key: "concat",
        value: function concat() {
          var _this5 = this;

          for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
            sources[_key] = arguments[_key];
          }

          var C = getSpecies(this);
          return new C(function (observer) {
            var subscription;
            var index = 0;

            function startNext(next) {
              subscription = next.subscribe({
                next: function (v) {
                  observer.next(v);
                },
                error: function (e) {
                  observer.error(e);
                },
                complete: function () {
                  if (index === sources.length) {
                    subscription = undefined;
                    observer.complete();
                  } else {
                    startNext(C.from(sources[index++]));
                  }
                }
              });
            }

            startNext(_this5);
            return function () {
              if (subscription) {
                subscription.unsubscribe();
                subscription = undefined;
              }
            };
          });
        }
      }, {
        key: "flatMap",
        value: function flatMap(fn) {
          var _this6 = this;

          if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
          var C = getSpecies(this);
          return new C(function (observer) {
            var subscriptions = [];

            var outer = _this6.subscribe({
              next: function (value) {
                if (fn) {
                  try {
                    value = fn(value);
                  } catch (e) {
                    return observer.error(e);
                  }
                }

                var inner = C.from(value).subscribe({
                  next: function (value) {
                    observer.next(value);
                  },
                  error: function (e) {
                    observer.error(e);
                  },
                  complete: function () {
                    var i = subscriptions.indexOf(inner);
                    if (i >= 0) subscriptions.splice(i, 1);
                    completeIfDone();
                  }
                });
                subscriptions.push(inner);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                completeIfDone();
              }
            });

            function completeIfDone() {
              if (outer.closed && subscriptions.length === 0) observer.complete();
            }

            return function () {
              subscriptions.forEach(function (s) {
                return s.unsubscribe();
              });
              outer.unsubscribe();
            };
          });
        }
      }, {
        key: SymbolObservable,
        value: function () {
          return this;
        }
      }], [{
        key: "from",
        value: function from(x) {
          var C = typeof this === 'function' ? this : Observable;
          if (x == null) throw new TypeError(x + ' is not an object');
          var method = getMethod(x, SymbolObservable);

          if (method) {
            var observable = method.call(x);
            if (Object(observable) !== observable) throw new TypeError(observable + ' is not an object');
            if (isObservable(observable) && observable.constructor === C) return observable;
            return new C(function (observer) {
              return observable.subscribe(observer);
            });
          }

          if (hasSymbol('iterator')) {
            method = getMethod(x, SymbolIterator);

            if (method) {
              return new C(function (observer) {
                enqueue(function () {
                  if (observer.closed) return;
                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;
                  var _iteratorError = undefined;

                  try {
                    for (var _iterator = method.call(x)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var _item = _step.value;
                      observer.next(_item);
                      if (observer.closed) return;
                    }
                  } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                      }
                    } finally {
                      if (_didIteratorError) {
                        throw _iteratorError;
                      }
                    }
                  }

                  observer.complete();
                });
              });
            }
          }

          if (Array.isArray(x)) {
            return new C(function (observer) {
              enqueue(function () {
                if (observer.closed) return;

                for (var i = 0; i < x.length; ++i) {
                  observer.next(x[i]);
                  if (observer.closed) return;
                }

                observer.complete();
              });
            });
          }

          throw new TypeError(x + ' is not observable');
        }
      }, {
        key: "of",
        value: function of() {
          for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            items[_key2] = arguments[_key2];
          }

          var C = typeof this === 'function' ? this : Observable;
          return new C(function (observer) {
            enqueue(function () {
              if (observer.closed) return;

              for (var i = 0; i < items.length; ++i) {
                observer.next(items[i]);
                if (observer.closed) return;
              }

              observer.complete();
            });
          });
        }
      }, {
        key: SymbolSpecies,
        get: function () {
          return this;
        }
      }]);

      return Observable;
    }();

    exports.Observable = Observable;

    if (hasSymbols()) {
      Object.defineProperty(Observable, Symbol('extensions'), {
        value: {
          symbol: SymbolObservable,
          hostReportError: hostReportError
        },
        configurable: true
      });
    }
    });

    var zenObservable = Observable_1.Observable;

    var Observable$1 = zenObservable;

    var genericMessage$5 = "Invariant Violation";
    var _a$7 = Object.setPrototypeOf, setPrototypeOf$5 = _a$7 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$7;
    var InvariantError$5 = /** @class */ (function (_super) {
        __extends$1(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage$5; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage$5 + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage$5;
            setPrototypeOf$5(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$5(condition, message) {
        if (!condition) {
            throw new InvariantError$5(message);
        }
    }
    function wrapConsoleMethod$5(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod$5("warn");
        invariant.error = wrapConsoleMethod$5("error");
    })(invariant$5 || (invariant$5 = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub$4 = { env: {} };
    if (typeof process === "object") {
        processStub$4 = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub$4);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    function validateOperation$1(operation) {
        var OPERATION_FIELDS = [
            'query',
            'operationName',
            'variables',
            'extensions',
            'context',
        ];
        for (var _i = 0, _a = Object.keys(operation); _i < _a.length; _i++) {
            var key = _a[_i];
            if (OPERATION_FIELDS.indexOf(key) < 0) {
                throw process.env.NODE_ENV === "production" ? new InvariantError$5(2) : new InvariantError$5("illegal argument: " + key);
            }
        }
        return operation;
    }
    var LinkError$1 = (function (_super) {
        __extends$1(LinkError, _super);
        function LinkError(message, link) {
            var _this = _super.call(this, message) || this;
            _this.link = link;
            return _this;
        }
        return LinkError;
    }(Error));
    function isTerminating$1(link) {
        return link.request.length <= 1;
    }
    function fromError$1(errorValue) {
        return new Observable$1(function (observer) {
            observer.error(errorValue);
        });
    }
    function transformOperation$1(operation) {
        var transformedOperation = {
            variables: operation.variables || {},
            extensions: operation.extensions || {},
            operationName: operation.operationName,
            query: operation.query,
        };
        if (!transformedOperation.operationName) {
            transformedOperation.operationName =
                typeof transformedOperation.query !== 'string'
                    ? getOperationName$1(transformedOperation.query)
                    : '';
        }
        return transformedOperation;
    }
    function createOperation$1(starting, operation) {
        var context = __assign$2({}, starting);
        var setContext = function (next) {
            if (typeof next === 'function') {
                context = __assign$2({}, context, next(context));
            }
            else {
                context = __assign$2({}, context, next);
            }
        };
        var getContext = function () { return (__assign$2({}, context)); };
        Object.defineProperty(operation, 'setContext', {
            enumerable: false,
            value: setContext,
        });
        Object.defineProperty(operation, 'getContext', {
            enumerable: false,
            value: getContext,
        });
        Object.defineProperty(operation, 'toKey', {
            enumerable: false,
            value: function () { return getKey(operation); },
        });
        return operation;
    }
    function getKey(operation) {
        var query = operation.query, variables = operation.variables, operationName = operation.operationName;
        return JSON.stringify([operationName, query, variables]);
    }

    function passthrough$1(op, forward) {
        return forward ? forward(op) : Observable$1.of();
    }
    function toLink$1(handler) {
        return typeof handler === 'function' ? new ApolloLink$1(handler) : handler;
    }
    function empty() {
        return new ApolloLink$1(function () { return Observable$1.of(); });
    }
    function from(links) {
        if (links.length === 0)
            return empty();
        return links.map(toLink$1).reduce(function (x, y) { return x.concat(y); });
    }
    function split(test, left, right) {
        var leftLink = toLink$1(left);
        var rightLink = toLink$1(right || new ApolloLink$1(passthrough$1));
        if (isTerminating$1(leftLink) && isTerminating$1(rightLink)) {
            return new ApolloLink$1(function (operation) {
                return test(operation)
                    ? leftLink.request(operation) || Observable$1.of()
                    : rightLink.request(operation) || Observable$1.of();
            });
        }
        else {
            return new ApolloLink$1(function (operation, forward) {
                return test(operation)
                    ? leftLink.request(operation, forward) || Observable$1.of()
                    : rightLink.request(operation, forward) || Observable$1.of();
            });
        }
    }
    var concat = function (first, second) {
        var firstLink = toLink$1(first);
        if (isTerminating$1(firstLink)) {
            process.env.NODE_ENV === "production" || invariant$5.warn(new LinkError$1("You are calling concat on a terminating link, which will have no effect", firstLink));
            return firstLink;
        }
        var nextLink = toLink$1(second);
        if (isTerminating$1(nextLink)) {
            return new ApolloLink$1(function (operation) {
                return firstLink.request(operation, function (op) { return nextLink.request(op) || Observable$1.of(); }) || Observable$1.of();
            });
        }
        else {
            return new ApolloLink$1(function (operation, forward) {
                return (firstLink.request(operation, function (op) {
                    return nextLink.request(op, forward) || Observable$1.of();
                }) || Observable$1.of());
            });
        }
    };
    var ApolloLink$1 = (function () {
        function ApolloLink(request) {
            if (request)
                this.request = request;
        }
        ApolloLink.prototype.split = function (test, left, right) {
            return this.concat(split(test, left, right || new ApolloLink(passthrough$1)));
        };
        ApolloLink.prototype.concat = function (next) {
            return concat(this, next);
        };
        ApolloLink.prototype.request = function (operation, forward) {
            throw process.env.NODE_ENV === "production" ? new InvariantError$5(1) : new InvariantError$5('request is not implemented');
        };
        ApolloLink.empty = empty;
        ApolloLink.from = from;
        ApolloLink.split = split;
        ApolloLink.execute = execute;
        return ApolloLink;
    }());
    function execute(link, operation) {
        return (link.request(createOperation$1(operation.context, transformOperation$1(validateOperation$1(operation)))) || Observable$1.of());
    }

    function symbolObservablePonyfill$1(root) {
    	var result;
    	var Symbol = root.Symbol;

    	if (typeof Symbol === 'function') {
    		if (Symbol.observable) {
    			result = Symbol.observable;
    		} else {
    			result = Symbol('observable');
    			Symbol.observable = result;
    		}
    	} else {
    		result = '@@observable';
    	}

    	return result;
    }

    /* global window */

    var root$1;

    if (typeof self !== 'undefined') {
      root$1 = self;
    } else if (typeof window !== 'undefined') {
      root$1 = window;
    } else if (typeof global !== 'undefined') {
      root$1 = global;
    } else if (typeof module !== 'undefined') {
      root$1 = module;
    } else {
      root$1 = Function('return this')();
    }

    var result = symbolObservablePonyfill$1(root$1);

    var genericMessage$4 = "Invariant Violation";
    var _a$6 = Object.setPrototypeOf, setPrototypeOf$4 = _a$6 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$6;
    var InvariantError$4 = /** @class */ (function (_super) {
        __extends$1(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage$4; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage$4 + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage$4;
            setPrototypeOf$4(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$4(condition, message) {
        if (!condition) {
            throw new InvariantError$4(message);
        }
    }
    function wrapConsoleMethod$4(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod$4("warn");
        invariant.error = wrapConsoleMethod$4("error");
    })(invariant$4 || (invariant$4 = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub$3 = { env: {} };
    if (typeof process === "object") {
        processStub$3 = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub$3);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    var NetworkStatus$1;
    (function (NetworkStatus) {
        NetworkStatus[NetworkStatus["loading"] = 1] = "loading";
        NetworkStatus[NetworkStatus["setVariables"] = 2] = "setVariables";
        NetworkStatus[NetworkStatus["fetchMore"] = 3] = "fetchMore";
        NetworkStatus[NetworkStatus["refetch"] = 4] = "refetch";
        NetworkStatus[NetworkStatus["poll"] = 6] = "poll";
        NetworkStatus[NetworkStatus["ready"] = 7] = "ready";
        NetworkStatus[NetworkStatus["error"] = 8] = "error";
    })(NetworkStatus$1 || (NetworkStatus$1 = {}));
    function isNetworkRequestInFlight$1(networkStatus) {
        return networkStatus < 7;
    }

    var Observable = (function (_super) {
        __extends$1(Observable, _super);
        function Observable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Observable.prototype[result] = function () {
            return this;
        };
        Observable.prototype['@@observable'] = function () {
            return this;
        };
        return Observable;
    }(Observable$1));

    function isNonEmptyArray$1(value) {
        return Array.isArray(value) && value.length > 0;
    }

    function isApolloError(err) {
        return err.hasOwnProperty('graphQLErrors');
    }
    var generateErrorMessage$1 = function (err) {
        var message = '';
        if (isNonEmptyArray$1(err.graphQLErrors)) {
            err.graphQLErrors.forEach(function (graphQLError) {
                var errorMessage = graphQLError
                    ? graphQLError.message
                    : 'Error message not found.';
                message += "GraphQL error: " + errorMessage + "\n";
            });
        }
        if (err.networkError) {
            message += 'Network error: ' + err.networkError.message + '\n';
        }
        message = message.replace(/\n$/, '');
        return message;
    };
    var ApolloError$1 = (function (_super) {
        __extends$1(ApolloError, _super);
        function ApolloError(_a) {
            var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError, errorMessage = _a.errorMessage, extraInfo = _a.extraInfo;
            var _this = _super.call(this, errorMessage) || this;
            _this.graphQLErrors = graphQLErrors || [];
            _this.networkError = networkError || null;
            if (!errorMessage) {
                _this.message = generateErrorMessage$1(_this);
            }
            else {
                _this.message = errorMessage;
            }
            _this.extraInfo = extraInfo;
            _this.__proto__ = ApolloError.prototype;
            return _this;
        }
        return ApolloError;
    }(Error));

    var FetchType;
    (function (FetchType) {
        FetchType[FetchType["normal"] = 1] = "normal";
        FetchType[FetchType["refetch"] = 2] = "refetch";
        FetchType[FetchType["poll"] = 3] = "poll";
    })(FetchType || (FetchType = {}));

    var hasError = function (storeValue, policy) {
        if (policy === void 0) { policy = 'none'; }
        return storeValue && (storeValue.networkError ||
            (policy === 'none' && isNonEmptyArray$1(storeValue.graphQLErrors)));
    };
    var ObservableQuery$1 = (function (_super) {
        __extends$1(ObservableQuery, _super);
        function ObservableQuery(_a) {
            var queryManager = _a.queryManager, options = _a.options, _b = _a.shouldSubscribe, shouldSubscribe = _b === void 0 ? true : _b;
            var _this = _super.call(this, function (observer) {
                return _this.onSubscribe(observer);
            }) || this;
            _this.observers = new Set();
            _this.subscriptions = new Set();
            _this.isTornDown = false;
            _this.options = options;
            _this.variables = options.variables || {};
            _this.queryId = queryManager.generateQueryId();
            _this.shouldSubscribe = shouldSubscribe;
            var opDef = getOperationDefinition$1(options.query);
            _this.queryName = opDef && opDef.name && opDef.name.value;
            _this.queryManager = queryManager;
            return _this;
        }
        ObservableQuery.prototype.result = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var observer = {
                    next: function (result) {
                        resolve(result);
                        _this.observers.delete(observer);
                        if (!_this.observers.size) {
                            _this.queryManager.removeQuery(_this.queryId);
                        }
                        setTimeout(function () {
                            subscription.unsubscribe();
                        }, 0);
                    },
                    error: reject,
                };
                var subscription = _this.subscribe(observer);
            });
        };
        ObservableQuery.prototype.currentResult = function () {
            var result = this.getCurrentResult();
            if (result.data === undefined) {
                result.data = {};
            }
            return result;
        };
        ObservableQuery.prototype.getCurrentResult = function () {
            if (this.isTornDown) {
                var lastResult = this.lastResult;
                return {
                    data: !this.lastError && lastResult && lastResult.data || void 0,
                    error: this.lastError,
                    loading: false,
                    networkStatus: NetworkStatus$1.error,
                };
            }
            var _a = this.queryManager.getCurrentQueryResult(this), data = _a.data, partial = _a.partial;
            var queryStoreValue = this.queryManager.queryStore.get(this.queryId);
            var result;
            var fetchPolicy = this.options.fetchPolicy;
            var isNetworkFetchPolicy = fetchPolicy === 'network-only' ||
                fetchPolicy === 'no-cache';
            if (queryStoreValue) {
                var networkStatus = queryStoreValue.networkStatus;
                if (hasError(queryStoreValue, this.options.errorPolicy)) {
                    return {
                        data: void 0,
                        loading: false,
                        networkStatus: networkStatus,
                        error: new ApolloError$1({
                            graphQLErrors: queryStoreValue.graphQLErrors,
                            networkError: queryStoreValue.networkError,
                        }),
                    };
                }
                if (queryStoreValue.variables) {
                    this.options.variables = __assign$2(__assign$2({}, this.options.variables), queryStoreValue.variables);
                    this.variables = this.options.variables;
                }
                result = {
                    data: data,
                    loading: isNetworkRequestInFlight$1(networkStatus),
                    networkStatus: networkStatus,
                };
                if (queryStoreValue.graphQLErrors && this.options.errorPolicy === 'all') {
                    result.errors = queryStoreValue.graphQLErrors;
                }
            }
            else {
                var loading = isNetworkFetchPolicy ||
                    (partial && fetchPolicy !== 'cache-only');
                result = {
                    data: data,
                    loading: loading,
                    networkStatus: loading ? NetworkStatus$1.loading : NetworkStatus$1.ready,
                };
            }
            if (!partial) {
                this.updateLastResult(__assign$2(__assign$2({}, result), { stale: false }));
            }
            return __assign$2(__assign$2({}, result), { partial: partial });
        };
        ObservableQuery.prototype.isDifferentFromLastResult = function (newResult) {
            var snapshot = this.lastResultSnapshot;
            return !(snapshot &&
                newResult &&
                snapshot.networkStatus === newResult.networkStatus &&
                snapshot.stale === newResult.stale &&
                equal$1(snapshot.data, newResult.data));
        };
        ObservableQuery.prototype.getLastResult = function () {
            return this.lastResult;
        };
        ObservableQuery.prototype.getLastError = function () {
            return this.lastError;
        };
        ObservableQuery.prototype.resetLastResults = function () {
            delete this.lastResult;
            delete this.lastResultSnapshot;
            delete this.lastError;
            this.isTornDown = false;
        };
        ObservableQuery.prototype.resetQueryStoreErrors = function () {
            var queryStore = this.queryManager.queryStore.get(this.queryId);
            if (queryStore) {
                queryStore.networkError = null;
                queryStore.graphQLErrors = [];
            }
        };
        ObservableQuery.prototype.refetch = function (variables) {
            var fetchPolicy = this.options.fetchPolicy;
            if (fetchPolicy === 'cache-only') {
                return Promise.reject(process.env.NODE_ENV === "production" ? new InvariantError$4(1) : new InvariantError$4('cache-only fetchPolicy option should not be used together with query refetch.'));
            }
            if (fetchPolicy !== 'no-cache' &&
                fetchPolicy !== 'cache-and-network') {
                fetchPolicy = 'network-only';
            }
            if (!equal$1(this.variables, variables)) {
                this.variables = __assign$2(__assign$2({}, this.variables), variables);
            }
            if (!equal$1(this.options.variables, this.variables)) {
                this.options.variables = __assign$2(__assign$2({}, this.options.variables), this.variables);
            }
            return this.queryManager.fetchQuery(this.queryId, __assign$2(__assign$2({}, this.options), { fetchPolicy: fetchPolicy }), FetchType.refetch);
        };
        ObservableQuery.prototype.fetchMore = function (fetchMoreOptions) {
            var _this = this;
            process.env.NODE_ENV === "production" ? invariant$4(fetchMoreOptions.updateQuery, 2) : invariant$4(fetchMoreOptions.updateQuery, 'updateQuery option is required. This function defines how to update the query data with the new results.');
            var combinedOptions = __assign$2(__assign$2({}, (fetchMoreOptions.query ? fetchMoreOptions : __assign$2(__assign$2(__assign$2({}, this.options), fetchMoreOptions), { variables: __assign$2(__assign$2({}, this.variables), fetchMoreOptions.variables) }))), { fetchPolicy: 'network-only' });
            var qid = this.queryManager.generateQueryId();
            return this.queryManager
                .fetchQuery(qid, combinedOptions, FetchType.normal, this.queryId)
                .then(function (fetchMoreResult) {
                _this.updateQuery(function (previousResult) {
                    return fetchMoreOptions.updateQuery(previousResult, {
                        fetchMoreResult: fetchMoreResult.data,
                        variables: combinedOptions.variables,
                    });
                });
                _this.queryManager.stopQuery(qid);
                return fetchMoreResult;
            }, function (error) {
                _this.queryManager.stopQuery(qid);
                throw error;
            });
        };
        ObservableQuery.prototype.subscribeToMore = function (options) {
            var _this = this;
            var subscription = this.queryManager
                .startGraphQLSubscription({
                query: options.document,
                variables: options.variables,
            })
                .subscribe({
                next: function (subscriptionData) {
                    var updateQuery = options.updateQuery;
                    if (updateQuery) {
                        _this.updateQuery(function (previous, _a) {
                            var variables = _a.variables;
                            return updateQuery(previous, {
                                subscriptionData: subscriptionData,
                                variables: variables,
                            });
                        });
                    }
                },
                error: function (err) {
                    if (options.onError) {
                        options.onError(err);
                        return;
                    }
                    process.env.NODE_ENV === "production" || invariant$4.error('Unhandled GraphQL subscription error', err);
                },
            });
            this.subscriptions.add(subscription);
            return function () {
                if (_this.subscriptions.delete(subscription)) {
                    subscription.unsubscribe();
                }
            };
        };
        ObservableQuery.prototype.setOptions = function (opts) {
            var oldFetchPolicy = this.options.fetchPolicy;
            this.options = __assign$2(__assign$2({}, this.options), opts);
            if (opts.pollInterval) {
                this.startPolling(opts.pollInterval);
            }
            else if (opts.pollInterval === 0) {
                this.stopPolling();
            }
            var fetchPolicy = opts.fetchPolicy;
            return this.setVariables(this.options.variables, oldFetchPolicy !== fetchPolicy && (oldFetchPolicy === 'cache-only' ||
                oldFetchPolicy === 'standby' ||
                fetchPolicy === 'network-only'), opts.fetchResults);
        };
        ObservableQuery.prototype.setVariables = function (variables, tryFetch, fetchResults) {
            if (tryFetch === void 0) { tryFetch = false; }
            if (fetchResults === void 0) { fetchResults = true; }
            this.isTornDown = false;
            variables = variables || this.variables;
            if (!tryFetch && equal$1(variables, this.variables)) {
                return this.observers.size && fetchResults
                    ? this.result()
                    : Promise.resolve();
            }
            this.variables = this.options.variables = variables;
            if (!this.observers.size) {
                return Promise.resolve();
            }
            return this.queryManager.fetchQuery(this.queryId, this.options);
        };
        ObservableQuery.prototype.updateQuery = function (mapFn) {
            var queryManager = this.queryManager;
            var _a = queryManager.getQueryWithPreviousResult(this.queryId), previousResult = _a.previousResult, variables = _a.variables, document = _a.document;
            var newResult = tryFunctionOrLogError(function () {
                return mapFn(previousResult, { variables: variables });
            });
            if (newResult) {
                queryManager.dataStore.markUpdateQueryResult(document, variables, newResult);
                queryManager.broadcastQueries();
            }
        };
        ObservableQuery.prototype.stopPolling = function () {
            this.queryManager.stopPollingQuery(this.queryId);
            this.options.pollInterval = undefined;
        };
        ObservableQuery.prototype.startPolling = function (pollInterval) {
            assertNotCacheFirstOrOnly(this);
            this.options.pollInterval = pollInterval;
            this.queryManager.startPollingQuery(this.options, this.queryId);
        };
        ObservableQuery.prototype.updateLastResult = function (newResult) {
            var previousResult = this.lastResult;
            this.lastResult = newResult;
            this.lastResultSnapshot = this.queryManager.assumeImmutableResults
                ? newResult
                : cloneDeep$1(newResult);
            return previousResult;
        };
        ObservableQuery.prototype.onSubscribe = function (observer) {
            var _this = this;
            try {
                var subObserver = observer._subscription._observer;
                if (subObserver && !subObserver.error) {
                    subObserver.error = defaultSubscriptionObserverErrorCallback$1;
                }
            }
            catch (_a) { }
            var first = !this.observers.size;
            this.observers.add(observer);
            if (observer.next && this.lastResult)
                observer.next(this.lastResult);
            if (observer.error && this.lastError)
                observer.error(this.lastError);
            if (first) {
                this.setUpQuery();
            }
            return function () {
                if (_this.observers.delete(observer) && !_this.observers.size) {
                    _this.tearDownQuery();
                }
            };
        };
        ObservableQuery.prototype.setUpQuery = function () {
            var _this = this;
            var _a = this, queryManager = _a.queryManager, queryId = _a.queryId;
            if (this.shouldSubscribe) {
                queryManager.addObservableQuery(queryId, this);
            }
            if (this.options.pollInterval) {
                assertNotCacheFirstOrOnly(this);
                queryManager.startPollingQuery(this.options, queryId);
            }
            var onError = function (error) {
                _this.updateLastResult(__assign$2(__assign$2({}, _this.lastResult), { errors: error.graphQLErrors, networkStatus: NetworkStatus$1.error, loading: false }));
                iterateObserversSafely$1(_this.observers, 'error', _this.lastError = error);
            };
            queryManager.observeQuery(queryId, this.options, {
                next: function (result) {
                    if (_this.lastError || _this.isDifferentFromLastResult(result)) {
                        var previousResult_1 = _this.updateLastResult(result);
                        var _a = _this.options, query_1 = _a.query, variables = _a.variables, fetchPolicy_1 = _a.fetchPolicy;
                        if (queryManager.transform(query_1).hasClientExports) {
                            queryManager.getLocalState().addExportedVariables(query_1, variables).then(function (variables) {
                                var previousVariables = _this.variables;
                                _this.variables = _this.options.variables = variables;
                                if (!result.loading &&
                                    previousResult_1 &&
                                    fetchPolicy_1 !== 'cache-only' &&
                                    queryManager.transform(query_1).serverQuery &&
                                    !equal$1(previousVariables, variables)) {
                                    _this.refetch();
                                }
                                else {
                                    iterateObserversSafely$1(_this.observers, 'next', result);
                                }
                            });
                        }
                        else {
                            iterateObserversSafely$1(_this.observers, 'next', result);
                        }
                    }
                },
                error: onError,
            }).catch(onError);
        };
        ObservableQuery.prototype.tearDownQuery = function () {
            var queryManager = this.queryManager;
            this.isTornDown = true;
            queryManager.stopPollingQuery(this.queryId);
            this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
            this.subscriptions.clear();
            queryManager.removeObservableQuery(this.queryId);
            queryManager.stopQuery(this.queryId);
            this.observers.clear();
        };
        return ObservableQuery;
    }(Observable));
    function defaultSubscriptionObserverErrorCallback$1(error) {
        process.env.NODE_ENV === "production" || invariant$4.error('Unhandled error', error.message, error.stack);
    }
    function iterateObserversSafely$1(observers, method, argument) {
        var observersWithMethod = [];
        observers.forEach(function (obs) { return obs[method] && observersWithMethod.push(obs); });
        observersWithMethod.forEach(function (obs) { return obs[method](argument); });
    }
    function assertNotCacheFirstOrOnly(obsQuery) {
        var fetchPolicy = obsQuery.options.fetchPolicy;
        process.env.NODE_ENV === "production" ? invariant$4(fetchPolicy !== 'cache-first' && fetchPolicy !== 'cache-only', 3) : invariant$4(fetchPolicy !== 'cache-first' && fetchPolicy !== 'cache-only', 'Queries that specify the cache-first and cache-only fetchPolicies cannot also be polling queries.');
    }

    var MutationStore = (function () {
        function MutationStore() {
            this.store = {};
        }
        MutationStore.prototype.getStore = function () {
            return this.store;
        };
        MutationStore.prototype.get = function (mutationId) {
            return this.store[mutationId];
        };
        MutationStore.prototype.initMutation = function (mutationId, mutation, variables) {
            this.store[mutationId] = {
                mutation: mutation,
                variables: variables || {},
                loading: true,
                error: null,
            };
        };
        MutationStore.prototype.markMutationError = function (mutationId, error) {
            var mutation = this.store[mutationId];
            if (mutation) {
                mutation.loading = false;
                mutation.error = error;
            }
        };
        MutationStore.prototype.markMutationResult = function (mutationId) {
            var mutation = this.store[mutationId];
            if (mutation) {
                mutation.loading = false;
                mutation.error = null;
            }
        };
        MutationStore.prototype.reset = function () {
            this.store = {};
        };
        return MutationStore;
    }());

    var QueryStore = (function () {
        function QueryStore() {
            this.store = {};
        }
        QueryStore.prototype.getStore = function () {
            return this.store;
        };
        QueryStore.prototype.get = function (queryId) {
            return this.store[queryId];
        };
        QueryStore.prototype.initQuery = function (query) {
            var previousQuery = this.store[query.queryId];
            process.env.NODE_ENV === "production" ? invariant$4(!previousQuery ||
                previousQuery.document === query.document ||
                equal$1(previousQuery.document, query.document), 19) : invariant$4(!previousQuery ||
                previousQuery.document === query.document ||
                equal$1(previousQuery.document, query.document), 'Internal Error: may not update existing query string in store');
            var isSetVariables = false;
            var previousVariables = null;
            if (query.storePreviousVariables &&
                previousQuery &&
                previousQuery.networkStatus !== NetworkStatus$1.loading) {
                if (!equal$1(previousQuery.variables, query.variables)) {
                    isSetVariables = true;
                    previousVariables = previousQuery.variables;
                }
            }
            var networkStatus;
            if (isSetVariables) {
                networkStatus = NetworkStatus$1.setVariables;
            }
            else if (query.isPoll) {
                networkStatus = NetworkStatus$1.poll;
            }
            else if (query.isRefetch) {
                networkStatus = NetworkStatus$1.refetch;
            }
            else {
                networkStatus = NetworkStatus$1.loading;
            }
            var graphQLErrors = [];
            if (previousQuery && previousQuery.graphQLErrors) {
                graphQLErrors = previousQuery.graphQLErrors;
            }
            this.store[query.queryId] = {
                document: query.document,
                variables: query.variables,
                previousVariables: previousVariables,
                networkError: null,
                graphQLErrors: graphQLErrors,
                networkStatus: networkStatus,
                metadata: query.metadata,
            };
            if (typeof query.fetchMoreForQueryId === 'string' &&
                this.store[query.fetchMoreForQueryId]) {
                this.store[query.fetchMoreForQueryId].networkStatus =
                    NetworkStatus$1.fetchMore;
            }
        };
        QueryStore.prototype.markQueryResult = function (queryId, result, fetchMoreForQueryId) {
            if (!this.store || !this.store[queryId])
                return;
            this.store[queryId].networkError = null;
            this.store[queryId].graphQLErrors = isNonEmptyArray$1(result.errors) ? result.errors : [];
            this.store[queryId].previousVariables = null;
            this.store[queryId].networkStatus = NetworkStatus$1.ready;
            if (typeof fetchMoreForQueryId === 'string' &&
                this.store[fetchMoreForQueryId]) {
                this.store[fetchMoreForQueryId].networkStatus = NetworkStatus$1.ready;
            }
        };
        QueryStore.prototype.markQueryError = function (queryId, error, fetchMoreForQueryId) {
            if (!this.store || !this.store[queryId])
                return;
            this.store[queryId].networkError = error;
            this.store[queryId].networkStatus = NetworkStatus$1.error;
            if (typeof fetchMoreForQueryId === 'string') {
                this.markQueryResultClient(fetchMoreForQueryId, true);
            }
        };
        QueryStore.prototype.markQueryResultClient = function (queryId, complete) {
            var storeValue = this.store && this.store[queryId];
            if (storeValue) {
                storeValue.networkError = null;
                storeValue.previousVariables = null;
                if (complete) {
                    storeValue.networkStatus = NetworkStatus$1.ready;
                }
            }
        };
        QueryStore.prototype.stopQuery = function (queryId) {
            delete this.store[queryId];
        };
        QueryStore.prototype.reset = function (observableQueryIds) {
            var _this = this;
            Object.keys(this.store).forEach(function (queryId) {
                if (observableQueryIds.indexOf(queryId) < 0) {
                    _this.stopQuery(queryId);
                }
                else {
                    _this.store[queryId].networkStatus = NetworkStatus$1.loading;
                }
            });
        };
        return QueryStore;
    }());

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    var LocalState = (function () {
        function LocalState(_a) {
            var cache = _a.cache, client = _a.client, resolvers = _a.resolvers, fragmentMatcher = _a.fragmentMatcher;
            this.cache = cache;
            if (client) {
                this.client = client;
            }
            if (resolvers) {
                this.addResolvers(resolvers);
            }
            if (fragmentMatcher) {
                this.setFragmentMatcher(fragmentMatcher);
            }
        }
        LocalState.prototype.addResolvers = function (resolvers) {
            var _this = this;
            this.resolvers = this.resolvers || {};
            if (Array.isArray(resolvers)) {
                resolvers.forEach(function (resolverGroup) {
                    _this.resolvers = mergeDeep(_this.resolvers, resolverGroup);
                });
            }
            else {
                this.resolvers = mergeDeep(this.resolvers, resolvers);
            }
        };
        LocalState.prototype.setResolvers = function (resolvers) {
            this.resolvers = {};
            this.addResolvers(resolvers);
        };
        LocalState.prototype.getResolvers = function () {
            return this.resolvers || {};
        };
        LocalState.prototype.runResolvers = function (_a) {
            var document = _a.document, remoteResult = _a.remoteResult, context = _a.context, variables = _a.variables, _b = _a.onlyRunForcedResolvers, onlyRunForcedResolvers = _b === void 0 ? false : _b;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_c) {
                    if (document) {
                        return [2, this.resolveDocument(document, remoteResult.data, context, variables, this.fragmentMatcher, onlyRunForcedResolvers).then(function (localResult) { return (__assign$2(__assign$2({}, remoteResult), { data: localResult.result })); })];
                    }
                    return [2, remoteResult];
                });
            });
        };
        LocalState.prototype.setFragmentMatcher = function (fragmentMatcher) {
            this.fragmentMatcher = fragmentMatcher;
        };
        LocalState.prototype.getFragmentMatcher = function () {
            return this.fragmentMatcher;
        };
        LocalState.prototype.clientQuery = function (document) {
            if (hasDirectives$1(['client'], document)) {
                if (this.resolvers) {
                    return document;
                }
                process.env.NODE_ENV === "production" || invariant$4.warn('Found @client directives in a query but no ApolloClient resolvers ' +
                    'were specified. This means ApolloClient local resolver handling ' +
                    'has been disabled, and @client directives will be passed through ' +
                    'to your link chain.');
            }
            return null;
        };
        LocalState.prototype.serverQuery = function (document) {
            return this.resolvers ? removeClientSetsFromDocument(document) : document;
        };
        LocalState.prototype.prepareContext = function (context) {
            if (context === void 0) { context = {}; }
            var cache = this.cache;
            var newContext = __assign$2(__assign$2({}, context), { cache: cache, getCacheKey: function (obj) {
                    if (cache.config) {
                        return cache.config.dataIdFromObject(obj);
                    }
                    else {
                        process.env.NODE_ENV === "production" ? invariant$4(false, 6) : invariant$4(false, 'To use context.getCacheKey, you need to use a cache that has ' +
                            'a configurable dataIdFromObject, like apollo-cache-inmemory.');
                    }
                } });
            return newContext;
        };
        LocalState.prototype.addExportedVariables = function (document, variables, context) {
            if (variables === void 0) { variables = {}; }
            if (context === void 0) { context = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (document) {
                        return [2, this.resolveDocument(document, this.buildRootValueFromCache(document, variables) || {}, this.prepareContext(context), variables).then(function (data) { return (__assign$2(__assign$2({}, variables), data.exportedVariables)); })];
                    }
                    return [2, __assign$2({}, variables)];
                });
            });
        };
        LocalState.prototype.shouldForceResolvers = function (document) {
            var forceResolvers = false;
            visit(document, {
                Directive: {
                    enter: function (node) {
                        if (node.name.value === 'client' && node.arguments) {
                            forceResolvers = node.arguments.some(function (arg) {
                                return arg.name.value === 'always' &&
                                    arg.value.kind === 'BooleanValue' &&
                                    arg.value.value === true;
                            });
                            if (forceResolvers) {
                                return BREAK;
                            }
                        }
                    },
                },
            });
            return forceResolvers;
        };
        LocalState.prototype.buildRootValueFromCache = function (document, variables) {
            return this.cache.diff({
                query: buildQueryFromSelectionSet(document),
                variables: variables,
                returnPartialData: true,
                optimistic: false,
            }).result;
        };
        LocalState.prototype.resolveDocument = function (document, rootValue, context, variables, fragmentMatcher, onlyRunForcedResolvers) {
            if (context === void 0) { context = {}; }
            if (variables === void 0) { variables = {}; }
            if (fragmentMatcher === void 0) { fragmentMatcher = function () { return true; }; }
            if (onlyRunForcedResolvers === void 0) { onlyRunForcedResolvers = false; }
            return __awaiter(this, void 0, void 0, function () {
                var mainDefinition, fragments, fragmentMap, definitionOperation, defaultOperationType, _a, cache, client, execContext;
                return __generator(this, function (_b) {
                    mainDefinition = getMainDefinition$1(document);
                    fragments = getFragmentDefinitions$1(document);
                    fragmentMap = createFragmentMap$1(fragments);
                    definitionOperation = mainDefinition
                        .operation;
                    defaultOperationType = definitionOperation
                        ? capitalizeFirstLetter(definitionOperation)
                        : 'Query';
                    _a = this, cache = _a.cache, client = _a.client;
                    execContext = {
                        fragmentMap: fragmentMap,
                        context: __assign$2(__assign$2({}, context), { cache: cache,
                            client: client }),
                        variables: variables,
                        fragmentMatcher: fragmentMatcher,
                        defaultOperationType: defaultOperationType,
                        exportedVariables: {},
                        onlyRunForcedResolvers: onlyRunForcedResolvers,
                    };
                    return [2, this.resolveSelectionSet(mainDefinition.selectionSet, rootValue, execContext).then(function (result) { return ({
                            result: result,
                            exportedVariables: execContext.exportedVariables,
                        }); })];
                });
            });
        };
        LocalState.prototype.resolveSelectionSet = function (selectionSet, rootValue, execContext) {
            return __awaiter(this, void 0, void 0, function () {
                var fragmentMap, context, variables, resultsToMerge, execute;
                var _this = this;
                return __generator(this, function (_a) {
                    fragmentMap = execContext.fragmentMap, context = execContext.context, variables = execContext.variables;
                    resultsToMerge = [rootValue];
                    execute = function (selection) { return __awaiter(_this, void 0, void 0, function () {
                        var fragment, typeCondition;
                        return __generator(this, function (_a) {
                            if (!shouldInclude$1(selection, variables)) {
                                return [2];
                            }
                            if (isField$1(selection)) {
                                return [2, this.resolveField(selection, rootValue, execContext).then(function (fieldResult) {
                                        var _a;
                                        if (typeof fieldResult !== 'undefined') {
                                            resultsToMerge.push((_a = {},
                                                _a[resultKeyNameFromField$1(selection)] = fieldResult,
                                                _a));
                                        }
                                    })];
                            }
                            if (isInlineFragment(selection)) {
                                fragment = selection;
                            }
                            else {
                                fragment = fragmentMap[selection.name.value];
                                process.env.NODE_ENV === "production" ? invariant$4(fragment, 7) : invariant$4(fragment, "No fragment named " + selection.name.value);
                            }
                            if (fragment && fragment.typeCondition) {
                                typeCondition = fragment.typeCondition.name.value;
                                if (execContext.fragmentMatcher(rootValue, typeCondition, context)) {
                                    return [2, this.resolveSelectionSet(fragment.selectionSet, rootValue, execContext).then(function (fragmentResult) {
                                            resultsToMerge.push(fragmentResult);
                                        })];
                                }
                            }
                            return [2];
                        });
                    }); };
                    return [2, Promise.all(selectionSet.selections.map(execute)).then(function () {
                            return mergeDeepArray$1(resultsToMerge);
                        })];
                });
            });
        };
        LocalState.prototype.resolveField = function (field, rootValue, execContext) {
            return __awaiter(this, void 0, void 0, function () {
                var variables, fieldName, aliasedFieldName, aliasUsed, defaultResult, resultPromise, resolverType, resolverMap, resolve;
                var _this = this;
                return __generator(this, function (_a) {
                    variables = execContext.variables;
                    fieldName = field.name.value;
                    aliasedFieldName = resultKeyNameFromField$1(field);
                    aliasUsed = fieldName !== aliasedFieldName;
                    defaultResult = rootValue[aliasedFieldName] || rootValue[fieldName];
                    resultPromise = Promise.resolve(defaultResult);
                    if (!execContext.onlyRunForcedResolvers ||
                        this.shouldForceResolvers(field)) {
                        resolverType = rootValue.__typename || execContext.defaultOperationType;
                        resolverMap = this.resolvers && this.resolvers[resolverType];
                        if (resolverMap) {
                            resolve = resolverMap[aliasUsed ? fieldName : aliasedFieldName];
                            if (resolve) {
                                resultPromise = Promise.resolve(resolve(rootValue, argumentsObjectFromField$1(field, variables), execContext.context, { field: field, fragmentMap: execContext.fragmentMap }));
                            }
                        }
                    }
                    return [2, resultPromise.then(function (result) {
                            if (result === void 0) { result = defaultResult; }
                            if (field.directives) {
                                field.directives.forEach(function (directive) {
                                    if (directive.name.value === 'export' && directive.arguments) {
                                        directive.arguments.forEach(function (arg) {
                                            if (arg.name.value === 'as' && arg.value.kind === 'StringValue') {
                                                execContext.exportedVariables[arg.value.value] = result;
                                            }
                                        });
                                    }
                                });
                            }
                            if (!field.selectionSet) {
                                return result;
                            }
                            if (result == null) {
                                return result;
                            }
                            if (Array.isArray(result)) {
                                return _this.resolveSubSelectedArray(field, result, execContext);
                            }
                            if (field.selectionSet) {
                                return _this.resolveSelectionSet(field.selectionSet, result, execContext);
                            }
                        })];
                });
            });
        };
        LocalState.prototype.resolveSubSelectedArray = function (field, result, execContext) {
            var _this = this;
            return Promise.all(result.map(function (item) {
                if (item === null) {
                    return null;
                }
                if (Array.isArray(item)) {
                    return _this.resolveSubSelectedArray(field, item, execContext);
                }
                if (field.selectionSet) {
                    return _this.resolveSelectionSet(field.selectionSet, item, execContext);
                }
            }));
        };
        return LocalState;
    }());

    function multiplex(inner) {
        var observers = new Set();
        var sub = null;
        return new Observable(function (observer) {
            observers.add(observer);
            sub = sub || inner.subscribe({
                next: function (value) {
                    observers.forEach(function (obs) { return obs.next && obs.next(value); });
                },
                error: function (error) {
                    observers.forEach(function (obs) { return obs.error && obs.error(error); });
                },
                complete: function () {
                    observers.forEach(function (obs) { return obs.complete && obs.complete(); });
                },
            });
            return function () {
                if (observers.delete(observer) && !observers.size && sub) {
                    sub.unsubscribe();
                    sub = null;
                }
            };
        });
    }
    function asyncMap(observable, mapFn) {
        return new Observable(function (observer) {
            var next = observer.next, error = observer.error, complete = observer.complete;
            var activeNextCount = 0;
            var completed = false;
            var handler = {
                next: function (value) {
                    ++activeNextCount;
                    new Promise(function (resolve) {
                        resolve(mapFn(value));
                    }).then(function (result) {
                        --activeNextCount;
                        next && next.call(observer, result);
                        completed && handler.complete();
                    }, function (e) {
                        --activeNextCount;
                        error && error.call(observer, e);
                    });
                },
                error: function (e) {
                    error && error.call(observer, e);
                },
                complete: function () {
                    completed = true;
                    if (!activeNextCount) {
                        complete && complete.call(observer);
                    }
                },
            };
            var sub = observable.subscribe(handler);
            return function () { return sub.unsubscribe(); };
        });
    }

    var hasOwnProperty$3 = Object.prototype.hasOwnProperty;
    var QueryManager = (function () {
        function QueryManager(_a) {
            var link = _a.link, _b = _a.queryDeduplication, queryDeduplication = _b === void 0 ? false : _b, store = _a.store, _c = _a.onBroadcast, onBroadcast = _c === void 0 ? function () { return undefined; } : _c, _d = _a.ssrMode, ssrMode = _d === void 0 ? false : _d, _e = _a.clientAwareness, clientAwareness = _e === void 0 ? {} : _e, localState = _a.localState, assumeImmutableResults = _a.assumeImmutableResults;
            this.mutationStore = new MutationStore();
            this.queryStore = new QueryStore();
            this.clientAwareness = {};
            this.idCounter = 1;
            this.queries = new Map();
            this.fetchQueryRejectFns = new Map();
            this.transformCache = new (canUseWeakMap$1 ? WeakMap : Map)();
            this.inFlightLinkObservables = new Map();
            this.pollingInfoByQueryId = new Map();
            this.link = link;
            this.queryDeduplication = queryDeduplication;
            this.dataStore = store;
            this.onBroadcast = onBroadcast;
            this.clientAwareness = clientAwareness;
            this.localState = localState || new LocalState({ cache: store.getCache() });
            this.ssrMode = ssrMode;
            this.assumeImmutableResults = !!assumeImmutableResults;
        }
        QueryManager.prototype.stop = function () {
            var _this = this;
            this.queries.forEach(function (_info, queryId) {
                _this.stopQueryNoBroadcast(queryId);
            });
            this.fetchQueryRejectFns.forEach(function (reject) {
                reject(process.env.NODE_ENV === "production" ? new InvariantError$4(8) : new InvariantError$4('QueryManager stopped while query was in flight'));
            });
        };
        QueryManager.prototype.mutate = function (_a) {
            var mutation = _a.mutation, variables = _a.variables, optimisticResponse = _a.optimisticResponse, updateQueriesByName = _a.updateQueries, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? [] : _b, _c = _a.awaitRefetchQueries, awaitRefetchQueries = _c === void 0 ? false : _c, updateWithProxyFn = _a.update, _d = _a.errorPolicy, errorPolicy = _d === void 0 ? 'none' : _d, fetchPolicy = _a.fetchPolicy, _e = _a.context, context = _e === void 0 ? {} : _e;
            return __awaiter(this, void 0, void 0, function () {
                var mutationId, generateUpdateQueriesInfo, self;
                var _this = this;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            process.env.NODE_ENV === "production" ? invariant$4(mutation, 9) : invariant$4(mutation, 'mutation option is required. You must specify your GraphQL document in the mutation option.');
                            process.env.NODE_ENV === "production" ? invariant$4(!fetchPolicy || fetchPolicy === 'no-cache', 10) : invariant$4(!fetchPolicy || fetchPolicy === 'no-cache', "Mutations only support a 'no-cache' fetchPolicy. If you don't want to disable the cache, remove your fetchPolicy setting to proceed with the default mutation behavior.");
                            mutationId = this.generateQueryId();
                            mutation = this.transform(mutation).document;
                            this.setQuery(mutationId, function () { return ({ document: mutation }); });
                            variables = this.getVariables(mutation, variables);
                            if (!this.transform(mutation).hasClientExports) return [3, 2];
                            return [4, this.localState.addExportedVariables(mutation, variables, context)];
                        case 1:
                            variables = _f.sent();
                            _f.label = 2;
                        case 2:
                            generateUpdateQueriesInfo = function () {
                                var ret = {};
                                if (updateQueriesByName) {
                                    _this.queries.forEach(function (_a, queryId) {
                                        var observableQuery = _a.observableQuery;
                                        if (observableQuery) {
                                            var queryName = observableQuery.queryName;
                                            if (queryName &&
                                                hasOwnProperty$3.call(updateQueriesByName, queryName)) {
                                                ret[queryId] = {
                                                    updater: updateQueriesByName[queryName],
                                                    query: _this.queryStore.get(queryId),
                                                };
                                            }
                                        }
                                    });
                                }
                                return ret;
                            };
                            this.mutationStore.initMutation(mutationId, mutation, variables);
                            this.dataStore.markMutationInit({
                                mutationId: mutationId,
                                document: mutation,
                                variables: variables,
                                updateQueries: generateUpdateQueriesInfo(),
                                update: updateWithProxyFn,
                                optimisticResponse: optimisticResponse,
                            });
                            this.broadcastQueries();
                            self = this;
                            return [2, new Promise(function (resolve, reject) {
                                    var storeResult;
                                    var error;
                                    self.getObservableFromLink(mutation, __assign$2(__assign$2({}, context), { optimisticResponse: optimisticResponse }), variables, false).subscribe({
                                        next: function (result) {
                                            if (graphQLResultHasError(result) && errorPolicy === 'none') {
                                                error = new ApolloError$1({
                                                    graphQLErrors: result.errors,
                                                });
                                                return;
                                            }
                                            self.mutationStore.markMutationResult(mutationId);
                                            if (fetchPolicy !== 'no-cache') {
                                                self.dataStore.markMutationResult({
                                                    mutationId: mutationId,
                                                    result: result,
                                                    document: mutation,
                                                    variables: variables,
                                                    updateQueries: generateUpdateQueriesInfo(),
                                                    update: updateWithProxyFn,
                                                });
                                            }
                                            storeResult = result;
                                        },
                                        error: function (err) {
                                            self.mutationStore.markMutationError(mutationId, err);
                                            self.dataStore.markMutationComplete({
                                                mutationId: mutationId,
                                                optimisticResponse: optimisticResponse,
                                            });
                                            self.broadcastQueries();
                                            self.setQuery(mutationId, function () { return ({ document: null }); });
                                            reject(new ApolloError$1({
                                                networkError: err,
                                            }));
                                        },
                                        complete: function () {
                                            if (error) {
                                                self.mutationStore.markMutationError(mutationId, error);
                                            }
                                            self.dataStore.markMutationComplete({
                                                mutationId: mutationId,
                                                optimisticResponse: optimisticResponse,
                                            });
                                            self.broadcastQueries();
                                            if (error) {
                                                reject(error);
                                                return;
                                            }
                                            if (typeof refetchQueries === 'function') {
                                                refetchQueries = refetchQueries(storeResult);
                                            }
                                            var refetchQueryPromises = [];
                                            if (isNonEmptyArray$1(refetchQueries)) {
                                                refetchQueries.forEach(function (refetchQuery) {
                                                    if (typeof refetchQuery === 'string') {
                                                        self.queries.forEach(function (_a) {
                                                            var observableQuery = _a.observableQuery;
                                                            if (observableQuery &&
                                                                observableQuery.queryName === refetchQuery) {
                                                                refetchQueryPromises.push(observableQuery.refetch());
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        var queryOptions = {
                                                            query: refetchQuery.query,
                                                            variables: refetchQuery.variables,
                                                            fetchPolicy: 'network-only',
                                                        };
                                                        if (refetchQuery.context) {
                                                            queryOptions.context = refetchQuery.context;
                                                        }
                                                        refetchQueryPromises.push(self.query(queryOptions));
                                                    }
                                                });
                                            }
                                            Promise.all(awaitRefetchQueries ? refetchQueryPromises : []).then(function () {
                                                self.setQuery(mutationId, function () { return ({ document: null }); });
                                                if (errorPolicy === 'ignore' &&
                                                    storeResult &&
                                                    graphQLResultHasError(storeResult)) {
                                                    delete storeResult.errors;
                                                }
                                                resolve(storeResult);
                                            });
                                        },
                                    });
                                })];
                    }
                });
            });
        };
        QueryManager.prototype.fetchQuery = function (queryId, options, fetchType, fetchMoreForQueryId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, metadata, _b, fetchPolicy, _c, context, query, variables, storeResult, isNetworkOnly, needToFetch, _d, complete, result, shouldFetch, requestId, cancel, networkResult;
                var _this = this;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = options.metadata, metadata = _a === void 0 ? null : _a, _b = options.fetchPolicy, fetchPolicy = _b === void 0 ? 'cache-first' : _b, _c = options.context, context = _c === void 0 ? {} : _c;
                            query = this.transform(options.query).document;
                            variables = this.getVariables(query, options.variables);
                            if (!this.transform(query).hasClientExports) return [3, 2];
                            return [4, this.localState.addExportedVariables(query, variables, context)];
                        case 1:
                            variables = _e.sent();
                            _e.label = 2;
                        case 2:
                            options = __assign$2(__assign$2({}, options), { variables: variables });
                            isNetworkOnly = fetchPolicy === 'network-only' || fetchPolicy === 'no-cache';
                            needToFetch = isNetworkOnly;
                            if (!isNetworkOnly) {
                                _d = this.dataStore.getCache().diff({
                                    query: query,
                                    variables: variables,
                                    returnPartialData: true,
                                    optimistic: false,
                                }), complete = _d.complete, result = _d.result;
                                needToFetch = !complete || fetchPolicy === 'cache-and-network';
                                storeResult = result;
                            }
                            shouldFetch = needToFetch && fetchPolicy !== 'cache-only' && fetchPolicy !== 'standby';
                            if (hasDirectives$1(['live'], query))
                                shouldFetch = true;
                            requestId = this.idCounter++;
                            cancel = fetchPolicy !== 'no-cache'
                                ? this.updateQueryWatch(queryId, query, options)
                                : undefined;
                            this.setQuery(queryId, function () { return ({
                                document: query,
                                lastRequestId: requestId,
                                invalidated: true,
                                cancel: cancel,
                            }); });
                            this.invalidate(fetchMoreForQueryId);
                            this.queryStore.initQuery({
                                queryId: queryId,
                                document: query,
                                storePreviousVariables: shouldFetch,
                                variables: variables,
                                isPoll: fetchType === FetchType.poll,
                                isRefetch: fetchType === FetchType.refetch,
                                metadata: metadata,
                                fetchMoreForQueryId: fetchMoreForQueryId,
                            });
                            this.broadcastQueries();
                            if (shouldFetch) {
                                networkResult = this.fetchRequest({
                                    requestId: requestId,
                                    queryId: queryId,
                                    document: query,
                                    options: options,
                                    fetchMoreForQueryId: fetchMoreForQueryId,
                                }).catch(function (error) {
                                    if (isApolloError(error)) {
                                        throw error;
                                    }
                                    else {
                                        if (requestId >= _this.getQuery(queryId).lastRequestId) {
                                            _this.queryStore.markQueryError(queryId, error, fetchMoreForQueryId);
                                            _this.invalidate(queryId);
                                            _this.invalidate(fetchMoreForQueryId);
                                            _this.broadcastQueries();
                                        }
                                        throw new ApolloError$1({ networkError: error });
                                    }
                                });
                                if (fetchPolicy !== 'cache-and-network') {
                                    return [2, networkResult];
                                }
                                networkResult.catch(function () { });
                            }
                            this.queryStore.markQueryResultClient(queryId, !shouldFetch);
                            this.invalidate(queryId);
                            this.invalidate(fetchMoreForQueryId);
                            if (this.transform(query).hasForcedResolvers) {
                                return [2, this.localState.runResolvers({
                                        document: query,
                                        remoteResult: { data: storeResult },
                                        context: context,
                                        variables: variables,
                                        onlyRunForcedResolvers: true,
                                    }).then(function (result) {
                                        _this.markQueryResult(queryId, result, options, fetchMoreForQueryId);
                                        _this.broadcastQueries();
                                        return result;
                                    })];
                            }
                            this.broadcastQueries();
                            return [2, { data: storeResult }];
                    }
                });
            });
        };
        QueryManager.prototype.markQueryResult = function (queryId, result, _a, fetchMoreForQueryId) {
            var fetchPolicy = _a.fetchPolicy, variables = _a.variables, errorPolicy = _a.errorPolicy;
            if (fetchPolicy === 'no-cache') {
                this.setQuery(queryId, function () { return ({
                    newData: { result: result.data, complete: true },
                }); });
            }
            else {
                this.dataStore.markQueryResult(result, this.getQuery(queryId).document, variables, fetchMoreForQueryId, errorPolicy === 'ignore' || errorPolicy === 'all');
            }
        };
        QueryManager.prototype.queryListenerForObserver = function (queryId, options, observer) {
            var _this = this;
            function invoke(method, argument) {
                if (observer[method]) {
                    try {
                        observer[method](argument);
                    }
                    catch (e) {
                        process.env.NODE_ENV === "production" || invariant$4.error(e);
                    }
                }
                else if (method === 'error') {
                    process.env.NODE_ENV === "production" || invariant$4.error(argument);
                }
            }
            return function (queryStoreValue, newData) {
                _this.invalidate(queryId, false);
                if (!queryStoreValue)
                    return;
                var _a = _this.getQuery(queryId), observableQuery = _a.observableQuery, document = _a.document;
                var fetchPolicy = observableQuery
                    ? observableQuery.options.fetchPolicy
                    : options.fetchPolicy;
                if (fetchPolicy === 'standby')
                    return;
                var loading = isNetworkRequestInFlight$1(queryStoreValue.networkStatus);
                var lastResult = observableQuery && observableQuery.getLastResult();
                var networkStatusChanged = !!(lastResult &&
                    lastResult.networkStatus !== queryStoreValue.networkStatus);
                var shouldNotifyIfLoading = options.returnPartialData ||
                    (!newData && queryStoreValue.previousVariables) ||
                    (networkStatusChanged && options.notifyOnNetworkStatusChange) ||
                    fetchPolicy === 'cache-only' ||
                    fetchPolicy === 'cache-and-network';
                if (loading && !shouldNotifyIfLoading) {
                    return;
                }
                var hasGraphQLErrors = isNonEmptyArray$1(queryStoreValue.graphQLErrors);
                var errorPolicy = observableQuery
                    && observableQuery.options.errorPolicy
                    || options.errorPolicy
                    || 'none';
                if (errorPolicy === 'none' && hasGraphQLErrors || queryStoreValue.networkError) {
                    return invoke('error', new ApolloError$1({
                        graphQLErrors: queryStoreValue.graphQLErrors,
                        networkError: queryStoreValue.networkError,
                    }));
                }
                try {
                    var data = void 0;
                    var isMissing = void 0;
                    if (newData) {
                        if (fetchPolicy !== 'no-cache' && fetchPolicy !== 'network-only') {
                            _this.setQuery(queryId, function () { return ({ newData: null }); });
                        }
                        data = newData.result;
                        isMissing = !newData.complete;
                    }
                    else {
                        var lastError = observableQuery && observableQuery.getLastError();
                        var errorStatusChanged = errorPolicy !== 'none' &&
                            (lastError && lastError.graphQLErrors) !==
                                queryStoreValue.graphQLErrors;
                        if (lastResult && lastResult.data && !errorStatusChanged) {
                            data = lastResult.data;
                            isMissing = false;
                        }
                        else {
                            var diffResult = _this.dataStore.getCache().diff({
                                query: document,
                                variables: queryStoreValue.previousVariables ||
                                    queryStoreValue.variables,
                                returnPartialData: true,
                                optimistic: true,
                            });
                            data = diffResult.result;
                            isMissing = !diffResult.complete;
                        }
                    }
                    var stale = isMissing && !(options.returnPartialData ||
                        fetchPolicy === 'cache-only');
                    var resultFromStore = {
                        data: stale ? lastResult && lastResult.data : data,
                        loading: loading,
                        networkStatus: queryStoreValue.networkStatus,
                        stale: stale,
                    };
                    if (errorPolicy === 'all' && hasGraphQLErrors) {
                        resultFromStore.errors = queryStoreValue.graphQLErrors;
                    }
                    invoke('next', resultFromStore);
                }
                catch (networkError) {
                    invoke('error', new ApolloError$1({ networkError: networkError }));
                }
            };
        };
        QueryManager.prototype.transform = function (document) {
            var transformCache = this.transformCache;
            if (!transformCache.has(document)) {
                var cache = this.dataStore.getCache();
                var transformed = cache.transformDocument(document);
                var forLink = removeConnectionDirectiveFromDocument(cache.transformForLink(transformed));
                var clientQuery = this.localState.clientQuery(transformed);
                var serverQuery = this.localState.serverQuery(forLink);
                var cacheEntry_1 = {
                    document: transformed,
                    hasClientExports: hasClientExports(transformed),
                    hasForcedResolvers: this.localState.shouldForceResolvers(transformed),
                    clientQuery: clientQuery,
                    serverQuery: serverQuery,
                    defaultVars: getDefaultValues$1(getOperationDefinition$1(transformed)),
                };
                var add = function (doc) {
                    if (doc && !transformCache.has(doc)) {
                        transformCache.set(doc, cacheEntry_1);
                    }
                };
                add(document);
                add(transformed);
                add(clientQuery);
                add(serverQuery);
            }
            return transformCache.get(document);
        };
        QueryManager.prototype.getVariables = function (document, variables) {
            return __assign$2(__assign$2({}, this.transform(document).defaultVars), variables);
        };
        QueryManager.prototype.watchQuery = function (options, shouldSubscribe) {
            if (shouldSubscribe === void 0) { shouldSubscribe = true; }
            process.env.NODE_ENV === "production" ? invariant$4(options.fetchPolicy !== 'standby', 11) : invariant$4(options.fetchPolicy !== 'standby', 'client.watchQuery cannot be called with fetchPolicy set to "standby"');
            options.variables = this.getVariables(options.query, options.variables);
            if (typeof options.notifyOnNetworkStatusChange === 'undefined') {
                options.notifyOnNetworkStatusChange = false;
            }
            var transformedOptions = __assign$2({}, options);
            return new ObservableQuery$1({
                queryManager: this,
                options: transformedOptions,
                shouldSubscribe: shouldSubscribe,
            });
        };
        QueryManager.prototype.query = function (options) {
            var _this = this;
            process.env.NODE_ENV === "production" ? invariant$4(options.query, 12) : invariant$4(options.query, 'query option is required. You must specify your GraphQL document ' +
                'in the query option.');
            process.env.NODE_ENV === "production" ? invariant$4(options.query.kind === 'Document', 13) : invariant$4(options.query.kind === 'Document', 'You must wrap the query string in a "gql" tag.');
            process.env.NODE_ENV === "production" ? invariant$4(!options.returnPartialData, 14) : invariant$4(!options.returnPartialData, 'returnPartialData option only supported on watchQuery.');
            process.env.NODE_ENV === "production" ? invariant$4(!options.pollInterval, 15) : invariant$4(!options.pollInterval, 'pollInterval option only supported on watchQuery.');
            return new Promise(function (resolve, reject) {
                var watchedQuery = _this.watchQuery(options, false);
                _this.fetchQueryRejectFns.set("query:" + watchedQuery.queryId, reject);
                watchedQuery
                    .result()
                    .then(resolve, reject)
                    .then(function () {
                    return _this.fetchQueryRejectFns.delete("query:" + watchedQuery.queryId);
                });
            });
        };
        QueryManager.prototype.generateQueryId = function () {
            return String(this.idCounter++);
        };
        QueryManager.prototype.stopQueryInStore = function (queryId) {
            this.stopQueryInStoreNoBroadcast(queryId);
            this.broadcastQueries();
        };
        QueryManager.prototype.stopQueryInStoreNoBroadcast = function (queryId) {
            this.stopPollingQuery(queryId);
            this.queryStore.stopQuery(queryId);
            this.invalidate(queryId);
        };
        QueryManager.prototype.addQueryListener = function (queryId, listener) {
            this.setQuery(queryId, function (_a) {
                var listeners = _a.listeners;
                listeners.add(listener);
                return { invalidated: false };
            });
        };
        QueryManager.prototype.updateQueryWatch = function (queryId, document, options) {
            var _this = this;
            var cancel = this.getQuery(queryId).cancel;
            if (cancel)
                cancel();
            var previousResult = function () {
                var previousResult = null;
                var observableQuery = _this.getQuery(queryId).observableQuery;
                if (observableQuery) {
                    var lastResult = observableQuery.getLastResult();
                    if (lastResult) {
                        previousResult = lastResult.data;
                    }
                }
                return previousResult;
            };
            return this.dataStore.getCache().watch({
                query: document,
                variables: options.variables,
                optimistic: true,
                previousResult: previousResult,
                callback: function (newData) {
                    _this.setQuery(queryId, function () { return ({ invalidated: true, newData: newData }); });
                },
            });
        };
        QueryManager.prototype.addObservableQuery = function (queryId, observableQuery) {
            this.setQuery(queryId, function () { return ({ observableQuery: observableQuery }); });
        };
        QueryManager.prototype.removeObservableQuery = function (queryId) {
            var cancel = this.getQuery(queryId).cancel;
            this.setQuery(queryId, function () { return ({ observableQuery: null }); });
            if (cancel)
                cancel();
        };
        QueryManager.prototype.clearStore = function () {
            this.fetchQueryRejectFns.forEach(function (reject) {
                reject(process.env.NODE_ENV === "production" ? new InvariantError$4(16) : new InvariantError$4('Store reset while query was in flight (not completed in link chain)'));
            });
            var resetIds = [];
            this.queries.forEach(function (_a, queryId) {
                var observableQuery = _a.observableQuery;
                if (observableQuery)
                    resetIds.push(queryId);
            });
            this.queryStore.reset(resetIds);
            this.mutationStore.reset();
            return this.dataStore.reset();
        };
        QueryManager.prototype.resetStore = function () {
            var _this = this;
            return this.clearStore().then(function () {
                return _this.reFetchObservableQueries();
            });
        };
        QueryManager.prototype.reFetchObservableQueries = function (includeStandby) {
            var _this = this;
            if (includeStandby === void 0) { includeStandby = false; }
            var observableQueryPromises = [];
            this.queries.forEach(function (_a, queryId) {
                var observableQuery = _a.observableQuery;
                if (observableQuery) {
                    var fetchPolicy = observableQuery.options.fetchPolicy;
                    observableQuery.resetLastResults();
                    if (fetchPolicy !== 'cache-only' &&
                        (includeStandby || fetchPolicy !== 'standby')) {
                        observableQueryPromises.push(observableQuery.refetch());
                    }
                    _this.setQuery(queryId, function () { return ({ newData: null }); });
                    _this.invalidate(queryId);
                }
            });
            this.broadcastQueries();
            return Promise.all(observableQueryPromises);
        };
        QueryManager.prototype.observeQuery = function (queryId, options, observer) {
            this.addQueryListener(queryId, this.queryListenerForObserver(queryId, options, observer));
            return this.fetchQuery(queryId, options);
        };
        QueryManager.prototype.startQuery = function (queryId, options, listener) {
            process.env.NODE_ENV === "production" || invariant$4.warn("The QueryManager.startQuery method has been deprecated");
            this.addQueryListener(queryId, listener);
            this.fetchQuery(queryId, options)
                .catch(function () { return undefined; });
            return queryId;
        };
        QueryManager.prototype.startGraphQLSubscription = function (_a) {
            var _this = this;
            var query = _a.query, fetchPolicy = _a.fetchPolicy, variables = _a.variables;
            query = this.transform(query).document;
            variables = this.getVariables(query, variables);
            var makeObservable = function (variables) {
                return _this.getObservableFromLink(query, {}, variables, false).map(function (result) {
                    if (!fetchPolicy || fetchPolicy !== 'no-cache') {
                        _this.dataStore.markSubscriptionResult(result, query, variables);
                        _this.broadcastQueries();
                    }
                    if (graphQLResultHasError(result)) {
                        throw new ApolloError$1({
                            graphQLErrors: result.errors,
                        });
                    }
                    return result;
                });
            };
            if (this.transform(query).hasClientExports) {
                var observablePromise_1 = this.localState.addExportedVariables(query, variables).then(makeObservable);
                return new Observable(function (observer) {
                    var sub = null;
                    observablePromise_1.then(function (observable) { return sub = observable.subscribe(observer); }, observer.error);
                    return function () { return sub && sub.unsubscribe(); };
                });
            }
            return makeObservable(variables);
        };
        QueryManager.prototype.stopQuery = function (queryId) {
            this.stopQueryNoBroadcast(queryId);
            this.broadcastQueries();
        };
        QueryManager.prototype.stopQueryNoBroadcast = function (queryId) {
            this.stopQueryInStoreNoBroadcast(queryId);
            this.removeQuery(queryId);
        };
        QueryManager.prototype.removeQuery = function (queryId) {
            this.fetchQueryRejectFns.delete("query:" + queryId);
            this.fetchQueryRejectFns.delete("fetchRequest:" + queryId);
            this.getQuery(queryId).subscriptions.forEach(function (x) { return x.unsubscribe(); });
            this.queries.delete(queryId);
        };
        QueryManager.prototype.getCurrentQueryResult = function (observableQuery, optimistic) {
            if (optimistic === void 0) { optimistic = true; }
            var _a = observableQuery.options, variables = _a.variables, query = _a.query, fetchPolicy = _a.fetchPolicy, returnPartialData = _a.returnPartialData;
            var lastResult = observableQuery.getLastResult();
            var newData = this.getQuery(observableQuery.queryId).newData;
            if (newData && newData.complete) {
                return { data: newData.result, partial: false };
            }
            if (fetchPolicy === 'no-cache' || fetchPolicy === 'network-only') {
                return { data: undefined, partial: false };
            }
            var _b = this.dataStore.getCache().diff({
                query: query,
                variables: variables,
                previousResult: lastResult ? lastResult.data : undefined,
                returnPartialData: true,
                optimistic: optimistic,
            }), result = _b.result, complete = _b.complete;
            return {
                data: (complete || returnPartialData) ? result : void 0,
                partial: !complete,
            };
        };
        QueryManager.prototype.getQueryWithPreviousResult = function (queryIdOrObservable) {
            var observableQuery;
            if (typeof queryIdOrObservable === 'string') {
                var foundObserveableQuery = this.getQuery(queryIdOrObservable).observableQuery;
                process.env.NODE_ENV === "production" ? invariant$4(foundObserveableQuery, 17) : invariant$4(foundObserveableQuery, "ObservableQuery with this id doesn't exist: " + queryIdOrObservable);
                observableQuery = foundObserveableQuery;
            }
            else {
                observableQuery = queryIdOrObservable;
            }
            var _a = observableQuery.options, variables = _a.variables, query = _a.query;
            return {
                previousResult: this.getCurrentQueryResult(observableQuery, false).data,
                variables: variables,
                document: query,
            };
        };
        QueryManager.prototype.broadcastQueries = function () {
            var _this = this;
            this.onBroadcast();
            this.queries.forEach(function (info, id) {
                if (info.invalidated) {
                    info.listeners.forEach(function (listener) {
                        if (listener) {
                            listener(_this.queryStore.get(id), info.newData);
                        }
                    });
                }
            });
        };
        QueryManager.prototype.getLocalState = function () {
            return this.localState;
        };
        QueryManager.prototype.getObservableFromLink = function (query, context, variables, deduplication) {
            var _this = this;
            if (deduplication === void 0) { deduplication = this.queryDeduplication; }
            var observable;
            var serverQuery = this.transform(query).serverQuery;
            if (serverQuery) {
                var _a = this, inFlightLinkObservables_1 = _a.inFlightLinkObservables, link = _a.link;
                var operation = {
                    query: serverQuery,
                    variables: variables,
                    operationName: getOperationName$1(serverQuery) || void 0,
                    context: this.prepareContext(__assign$2(__assign$2({}, context), { forceFetch: !deduplication })),
                };
                context = operation.context;
                if (deduplication) {
                    var byVariables_1 = inFlightLinkObservables_1.get(serverQuery) || new Map();
                    inFlightLinkObservables_1.set(serverQuery, byVariables_1);
                    var varJson_1 = JSON.stringify(variables);
                    observable = byVariables_1.get(varJson_1);
                    if (!observable) {
                        byVariables_1.set(varJson_1, observable = multiplex(execute(link, operation)));
                        var cleanup = function () {
                            byVariables_1.delete(varJson_1);
                            if (!byVariables_1.size)
                                inFlightLinkObservables_1.delete(serverQuery);
                            cleanupSub_1.unsubscribe();
                        };
                        var cleanupSub_1 = observable.subscribe({
                            next: cleanup,
                            error: cleanup,
                            complete: cleanup,
                        });
                    }
                }
                else {
                    observable = multiplex(execute(link, operation));
                }
            }
            else {
                observable = Observable.of({ data: {} });
                context = this.prepareContext(context);
            }
            var clientQuery = this.transform(query).clientQuery;
            if (clientQuery) {
                observable = asyncMap(observable, function (result) {
                    return _this.localState.runResolvers({
                        document: clientQuery,
                        remoteResult: result,
                        context: context,
                        variables: variables,
                    });
                });
            }
            return observable;
        };
        QueryManager.prototype.fetchRequest = function (_a) {
            var _this = this;
            var requestId = _a.requestId, queryId = _a.queryId, document = _a.document, options = _a.options, fetchMoreForQueryId = _a.fetchMoreForQueryId;
            var variables = options.variables, _b = options.errorPolicy, errorPolicy = _b === void 0 ? 'none' : _b, fetchPolicy = options.fetchPolicy;
            var resultFromStore;
            var errorsFromStore;
            return new Promise(function (resolve, reject) {
                var observable = _this.getObservableFromLink(document, options.context, variables);
                var fqrfId = "fetchRequest:" + queryId;
                _this.fetchQueryRejectFns.set(fqrfId, reject);
                var cleanup = function () {
                    _this.fetchQueryRejectFns.delete(fqrfId);
                    _this.setQuery(queryId, function (_a) {
                        var subscriptions = _a.subscriptions;
                        subscriptions.delete(subscription);
                    });
                };
                var subscription = observable.map(function (result) {
                    if (requestId >= _this.getQuery(queryId).lastRequestId) {
                        _this.markQueryResult(queryId, result, options, fetchMoreForQueryId);
                        _this.queryStore.markQueryResult(queryId, result, fetchMoreForQueryId);
                        _this.invalidate(queryId);
                        _this.invalidate(fetchMoreForQueryId);
                        _this.broadcastQueries();
                    }
                    if (errorPolicy === 'none' && isNonEmptyArray$1(result.errors)) {
                        return reject(new ApolloError$1({
                            graphQLErrors: result.errors,
                        }));
                    }
                    if (errorPolicy === 'all') {
                        errorsFromStore = result.errors;
                    }
                    if (fetchMoreForQueryId || fetchPolicy === 'no-cache') {
                        resultFromStore = result.data;
                    }
                    else {
                        var _a = _this.dataStore.getCache().diff({
                            variables: variables,
                            query: document,
                            optimistic: false,
                            returnPartialData: true,
                        }), result_1 = _a.result, complete = _a.complete;
                        if (complete || options.returnPartialData) {
                            resultFromStore = result_1;
                        }
                    }
                }).subscribe({
                    error: function (error) {
                        cleanup();
                        reject(error);
                    },
                    complete: function () {
                        cleanup();
                        resolve({
                            data: resultFromStore,
                            errors: errorsFromStore,
                            loading: false,
                            networkStatus: NetworkStatus$1.ready,
                            stale: false,
                        });
                    },
                });
                _this.setQuery(queryId, function (_a) {
                    var subscriptions = _a.subscriptions;
                    subscriptions.add(subscription);
                });
            });
        };
        QueryManager.prototype.getQuery = function (queryId) {
            return (this.queries.get(queryId) || {
                listeners: new Set(),
                invalidated: false,
                document: null,
                newData: null,
                lastRequestId: 1,
                observableQuery: null,
                subscriptions: new Set(),
            });
        };
        QueryManager.prototype.setQuery = function (queryId, updater) {
            var prev = this.getQuery(queryId);
            var newInfo = __assign$2(__assign$2({}, prev), updater(prev));
            this.queries.set(queryId, newInfo);
        };
        QueryManager.prototype.invalidate = function (queryId, invalidated) {
            if (invalidated === void 0) { invalidated = true; }
            if (queryId) {
                this.setQuery(queryId, function () { return ({ invalidated: invalidated }); });
            }
        };
        QueryManager.prototype.prepareContext = function (context) {
            if (context === void 0) { context = {}; }
            var newContext = this.localState.prepareContext(context);
            return __assign$2(__assign$2({}, newContext), { clientAwareness: this.clientAwareness });
        };
        QueryManager.prototype.checkInFlight = function (queryId) {
            var query = this.queryStore.get(queryId);
            return (query &&
                query.networkStatus !== NetworkStatus$1.ready &&
                query.networkStatus !== NetworkStatus$1.error);
        };
        QueryManager.prototype.startPollingQuery = function (options, queryId, listener) {
            var _this = this;
            var pollInterval = options.pollInterval;
            process.env.NODE_ENV === "production" ? invariant$4(pollInterval, 18) : invariant$4(pollInterval, 'Attempted to start a polling query without a polling interval.');
            if (!this.ssrMode) {
                var info = this.pollingInfoByQueryId.get(queryId);
                if (!info) {
                    this.pollingInfoByQueryId.set(queryId, (info = {}));
                }
                info.interval = pollInterval;
                info.options = __assign$2(__assign$2({}, options), { fetchPolicy: 'network-only' });
                var maybeFetch_1 = function () {
                    var info = _this.pollingInfoByQueryId.get(queryId);
                    if (info) {
                        if (_this.checkInFlight(queryId)) {
                            poll_1();
                        }
                        else {
                            _this.fetchQuery(queryId, info.options, FetchType.poll).then(poll_1, poll_1);
                        }
                    }
                };
                var poll_1 = function () {
                    var info = _this.pollingInfoByQueryId.get(queryId);
                    if (info) {
                        clearTimeout(info.timeout);
                        info.timeout = setTimeout(maybeFetch_1, info.interval);
                    }
                };
                if (listener) {
                    this.addQueryListener(queryId, listener);
                }
                poll_1();
            }
            return queryId;
        };
        QueryManager.prototype.stopPollingQuery = function (queryId) {
            this.pollingInfoByQueryId.delete(queryId);
        };
        return QueryManager;
    }());

    var DataStore = (function () {
        function DataStore(initialCache) {
            this.cache = initialCache;
        }
        DataStore.prototype.getCache = function () {
            return this.cache;
        };
        DataStore.prototype.markQueryResult = function (result, document, variables, fetchMoreForQueryId, ignoreErrors) {
            if (ignoreErrors === void 0) { ignoreErrors = false; }
            var writeWithErrors = !graphQLResultHasError(result);
            if (ignoreErrors && graphQLResultHasError(result) && result.data) {
                writeWithErrors = true;
            }
            if (!fetchMoreForQueryId && writeWithErrors) {
                this.cache.write({
                    result: result.data,
                    dataId: 'ROOT_QUERY',
                    query: document,
                    variables: variables,
                });
            }
        };
        DataStore.prototype.markSubscriptionResult = function (result, document, variables) {
            if (!graphQLResultHasError(result)) {
                this.cache.write({
                    result: result.data,
                    dataId: 'ROOT_SUBSCRIPTION',
                    query: document,
                    variables: variables,
                });
            }
        };
        DataStore.prototype.markMutationInit = function (mutation) {
            var _this = this;
            if (mutation.optimisticResponse) {
                var optimistic_1;
                if (typeof mutation.optimisticResponse === 'function') {
                    optimistic_1 = mutation.optimisticResponse(mutation.variables);
                }
                else {
                    optimistic_1 = mutation.optimisticResponse;
                }
                this.cache.recordOptimisticTransaction(function (c) {
                    var orig = _this.cache;
                    _this.cache = c;
                    try {
                        _this.markMutationResult({
                            mutationId: mutation.mutationId,
                            result: { data: optimistic_1 },
                            document: mutation.document,
                            variables: mutation.variables,
                            updateQueries: mutation.updateQueries,
                            update: mutation.update,
                        });
                    }
                    finally {
                        _this.cache = orig;
                    }
                }, mutation.mutationId);
            }
        };
        DataStore.prototype.markMutationResult = function (mutation) {
            var _this = this;
            if (!graphQLResultHasError(mutation.result)) {
                var cacheWrites_1 = [{
                        result: mutation.result.data,
                        dataId: 'ROOT_MUTATION',
                        query: mutation.document,
                        variables: mutation.variables,
                    }];
                var updateQueries_1 = mutation.updateQueries;
                if (updateQueries_1) {
                    Object.keys(updateQueries_1).forEach(function (id) {
                        var _a = updateQueries_1[id], query = _a.query, updater = _a.updater;
                        var _b = _this.cache.diff({
                            query: query.document,
                            variables: query.variables,
                            returnPartialData: true,
                            optimistic: false,
                        }), currentQueryResult = _b.result, complete = _b.complete;
                        if (complete) {
                            var nextQueryResult = tryFunctionOrLogError(function () {
                                return updater(currentQueryResult, {
                                    mutationResult: mutation.result,
                                    queryName: getOperationName$1(query.document) || undefined,
                                    queryVariables: query.variables,
                                });
                            });
                            if (nextQueryResult) {
                                cacheWrites_1.push({
                                    result: nextQueryResult,
                                    dataId: 'ROOT_QUERY',
                                    query: query.document,
                                    variables: query.variables,
                                });
                            }
                        }
                    });
                }
                this.cache.performTransaction(function (c) {
                    cacheWrites_1.forEach(function (write) { return c.write(write); });
                    var update = mutation.update;
                    if (update) {
                        tryFunctionOrLogError(function () { return update(c, mutation.result); });
                    }
                });
            }
        };
        DataStore.prototype.markMutationComplete = function (_a) {
            var mutationId = _a.mutationId, optimisticResponse = _a.optimisticResponse;
            if (optimisticResponse) {
                this.cache.removeOptimistic(mutationId);
            }
        };
        DataStore.prototype.markUpdateQueryResult = function (document, variables, newResult) {
            this.cache.write({
                result: newResult,
                dataId: 'ROOT_QUERY',
                variables: variables,
                query: document,
            });
        };
        DataStore.prototype.reset = function () {
            return this.cache.reset();
        };
        return DataStore;
    }());

    var version = "2.6.10";

    var hasSuggestedDevtools = false;
    var ApolloClient = (function () {
        function ApolloClient(options) {
            var _this = this;
            this.defaultOptions = {};
            this.resetStoreCallbacks = [];
            this.clearStoreCallbacks = [];
            var cache = options.cache, _a = options.ssrMode, ssrMode = _a === void 0 ? false : _a, _b = options.ssrForceFetchDelay, ssrForceFetchDelay = _b === void 0 ? 0 : _b, connectToDevTools = options.connectToDevTools, _c = options.queryDeduplication, queryDeduplication = _c === void 0 ? true : _c, defaultOptions = options.defaultOptions, _d = options.assumeImmutableResults, assumeImmutableResults = _d === void 0 ? false : _d, resolvers = options.resolvers, typeDefs = options.typeDefs, fragmentMatcher = options.fragmentMatcher, clientAwarenessName = options.name, clientAwarenessVersion = options.version;
            var link = options.link;
            if (!link && resolvers) {
                link = ApolloLink$1.empty();
            }
            if (!link || !cache) {
                throw process.env.NODE_ENV === "production" ? new InvariantError$4(4) : new InvariantError$4("In order to initialize Apollo Client, you must specify 'link' and 'cache' properties in the options object.\n" +
                    "These options are part of the upgrade requirements when migrating from Apollo Client 1.x to Apollo Client 2.x.\n" +
                    "For more information, please visit: https://www.apollographql.com/docs/tutorial/client.html#apollo-client-setup");
            }
            this.link = link;
            this.cache = cache;
            this.store = new DataStore(cache);
            this.disableNetworkFetches = ssrMode || ssrForceFetchDelay > 0;
            this.queryDeduplication = queryDeduplication;
            this.defaultOptions = defaultOptions || {};
            this.typeDefs = typeDefs;
            if (ssrForceFetchDelay) {
                setTimeout(function () { return (_this.disableNetworkFetches = false); }, ssrForceFetchDelay);
            }
            this.watchQuery = this.watchQuery.bind(this);
            this.query = this.query.bind(this);
            this.mutate = this.mutate.bind(this);
            this.resetStore = this.resetStore.bind(this);
            this.reFetchObservableQueries = this.reFetchObservableQueries.bind(this);
            var defaultConnectToDevTools = process.env.NODE_ENV !== 'production' &&
                typeof window !== 'undefined' &&
                !window.__APOLLO_CLIENT__;
            if (typeof connectToDevTools === 'undefined'
                ? defaultConnectToDevTools
                : connectToDevTools && typeof window !== 'undefined') {
                window.__APOLLO_CLIENT__ = this;
            }
            if (!hasSuggestedDevtools && process.env.NODE_ENV !== 'production') {
                hasSuggestedDevtools = true;
                if (typeof window !== 'undefined' &&
                    window.document &&
                    window.top === window.self) {
                    if (typeof window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
                        if (window.navigator &&
                            window.navigator.userAgent &&
                            window.navigator.userAgent.indexOf('Chrome') > -1) {
                            console.debug('Download the Apollo DevTools ' +
                                'for a better development experience: ' +
                                'https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm');
                        }
                    }
                }
            }
            this.version = version;
            this.localState = new LocalState({
                cache: cache,
                client: this,
                resolvers: resolvers,
                fragmentMatcher: fragmentMatcher,
            });
            this.queryManager = new QueryManager({
                link: this.link,
                store: this.store,
                queryDeduplication: queryDeduplication,
                ssrMode: ssrMode,
                clientAwareness: {
                    name: clientAwarenessName,
                    version: clientAwarenessVersion,
                },
                localState: this.localState,
                assumeImmutableResults: assumeImmutableResults,
                onBroadcast: function () {
                    if (_this.devToolsHookCb) {
                        _this.devToolsHookCb({
                            action: {},
                            state: {
                                queries: _this.queryManager.queryStore.getStore(),
                                mutations: _this.queryManager.mutationStore.getStore(),
                            },
                            dataWithOptimisticResults: _this.cache.extract(true),
                        });
                    }
                },
            });
        }
        ApolloClient.prototype.stop = function () {
            this.queryManager.stop();
        };
        ApolloClient.prototype.watchQuery = function (options) {
            if (this.defaultOptions.watchQuery) {
                options = __assign$2(__assign$2({}, this.defaultOptions.watchQuery), options);
            }
            if (this.disableNetworkFetches &&
                (options.fetchPolicy === 'network-only' ||
                    options.fetchPolicy === 'cache-and-network')) {
                options = __assign$2(__assign$2({}, options), { fetchPolicy: 'cache-first' });
            }
            return this.queryManager.watchQuery(options);
        };
        ApolloClient.prototype.query = function (options) {
            if (this.defaultOptions.query) {
                options = __assign$2(__assign$2({}, this.defaultOptions.query), options);
            }
            process.env.NODE_ENV === "production" ? invariant$4(options.fetchPolicy !== 'cache-and-network', 5) : invariant$4(options.fetchPolicy !== 'cache-and-network', 'The cache-and-network fetchPolicy does not work with client.query, because ' +
                'client.query can only return a single result. Please use client.watchQuery ' +
                'to receive multiple results from the cache and the network, or consider ' +
                'using a different fetchPolicy, such as cache-first or network-only.');
            if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
                options = __assign$2(__assign$2({}, options), { fetchPolicy: 'cache-first' });
            }
            return this.queryManager.query(options);
        };
        ApolloClient.prototype.mutate = function (options) {
            if (this.defaultOptions.mutate) {
                options = __assign$2(__assign$2({}, this.defaultOptions.mutate), options);
            }
            return this.queryManager.mutate(options);
        };
        ApolloClient.prototype.subscribe = function (options) {
            return this.queryManager.startGraphQLSubscription(options);
        };
        ApolloClient.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.cache.readQuery(options, optimistic);
        };
        ApolloClient.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.cache.readFragment(options, optimistic);
        };
        ApolloClient.prototype.writeQuery = function (options) {
            var result = this.cache.writeQuery(options);
            this.queryManager.broadcastQueries();
            return result;
        };
        ApolloClient.prototype.writeFragment = function (options) {
            var result = this.cache.writeFragment(options);
            this.queryManager.broadcastQueries();
            return result;
        };
        ApolloClient.prototype.writeData = function (options) {
            var result = this.cache.writeData(options);
            this.queryManager.broadcastQueries();
            return result;
        };
        ApolloClient.prototype.__actionHookForDevTools = function (cb) {
            this.devToolsHookCb = cb;
        };
        ApolloClient.prototype.__requestRaw = function (payload) {
            return execute(this.link, payload);
        };
        ApolloClient.prototype.initQueryManager = function () {
            process.env.NODE_ENV === "production" || invariant$4.warn('Calling the initQueryManager method is no longer necessary, ' +
                'and it will be removed from ApolloClient in version 3.0.');
            return this.queryManager;
        };
        ApolloClient.prototype.resetStore = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () { return _this.queryManager.clearStore(); })
                .then(function () { return Promise.all(_this.resetStoreCallbacks.map(function (fn) { return fn(); })); })
                .then(function () { return _this.reFetchObservableQueries(); });
        };
        ApolloClient.prototype.clearStore = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () { return _this.queryManager.clearStore(); })
                .then(function () { return Promise.all(_this.clearStoreCallbacks.map(function (fn) { return fn(); })); });
        };
        ApolloClient.prototype.onResetStore = function (cb) {
            var _this = this;
            this.resetStoreCallbacks.push(cb);
            return function () {
                _this.resetStoreCallbacks = _this.resetStoreCallbacks.filter(function (c) { return c !== cb; });
            };
        };
        ApolloClient.prototype.onClearStore = function (cb) {
            var _this = this;
            this.clearStoreCallbacks.push(cb);
            return function () {
                _this.clearStoreCallbacks = _this.clearStoreCallbacks.filter(function (c) { return c !== cb; });
            };
        };
        ApolloClient.prototype.reFetchObservableQueries = function (includeStandby) {
            return this.queryManager.reFetchObservableQueries(includeStandby);
        };
        ApolloClient.prototype.extract = function (optimistic) {
            return this.cache.extract(optimistic);
        };
        ApolloClient.prototype.restore = function (serializedState) {
            return this.cache.restore(serializedState);
        };
        ApolloClient.prototype.addResolvers = function (resolvers) {
            this.localState.addResolvers(resolvers);
        };
        ApolloClient.prototype.setResolvers = function (resolvers) {
            this.localState.setResolvers(resolvers);
        };
        ApolloClient.prototype.getResolvers = function () {
            return this.localState.getResolvers();
        };
        ApolloClient.prototype.setLocalStateFragmentMatcher = function (fragmentMatcher) {
            this.localState.setFragmentMatcher(fragmentMatcher);
        };
        return ApolloClient;
    }());

    function queryFromPojo(obj) {
        var op = {
            kind: 'OperationDefinition',
            operation: 'query',
            name: {
                kind: 'Name',
                value: 'GeneratedClientQuery',
            },
            selectionSet: selectionSetFromObj(obj),
        };
        var out = {
            kind: 'Document',
            definitions: [op],
        };
        return out;
    }
    function fragmentFromPojo(obj, typename) {
        var frag = {
            kind: 'FragmentDefinition',
            typeCondition: {
                kind: 'NamedType',
                name: {
                    kind: 'Name',
                    value: typename || '__FakeType',
                },
            },
            name: {
                kind: 'Name',
                value: 'GeneratedClientQuery',
            },
            selectionSet: selectionSetFromObj(obj),
        };
        var out = {
            kind: 'Document',
            definitions: [frag],
        };
        return out;
    }
    function selectionSetFromObj(obj) {
        if (typeof obj === 'number' ||
            typeof obj === 'boolean' ||
            typeof obj === 'string' ||
            typeof obj === 'undefined' ||
            obj === null) {
            return null;
        }
        if (Array.isArray(obj)) {
            return selectionSetFromObj(obj[0]);
        }
        var selections = [];
        Object.keys(obj).forEach(function (key) {
            var nestedSelSet = selectionSetFromObj(obj[key]);
            var field = {
                kind: 'Field',
                name: {
                    kind: 'Name',
                    value: key,
                },
                selectionSet: nestedSelSet || undefined,
            };
            selections.push(field);
        });
        var selectionSet = {
            kind: 'SelectionSet',
            selections: selections,
        };
        return selectionSet;
    }
    var justTypenameQuery = {
        kind: 'Document',
        definitions: [
            {
                kind: 'OperationDefinition',
                operation: 'query',
                name: null,
                variableDefinitions: null,
                directives: [],
                selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                        {
                            kind: 'Field',
                            alias: null,
                            name: {
                                kind: 'Name',
                                value: '__typename',
                            },
                            arguments: [],
                            directives: [],
                            selectionSet: null,
                        },
                    ],
                },
            },
        ],
    };

    var ApolloCache$1 = (function () {
        function ApolloCache() {
        }
        ApolloCache.prototype.transformDocument = function (document) {
            return document;
        };
        ApolloCache.prototype.transformForLink = function (document) {
            return document;
        };
        ApolloCache.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.read({
                query: options.query,
                variables: options.variables,
                optimistic: optimistic,
            });
        };
        ApolloCache.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.read({
                query: getFragmentQueryDocument$1(options.fragment, options.fragmentName),
                variables: options.variables,
                rootId: options.id,
                optimistic: optimistic,
            });
        };
        ApolloCache.prototype.writeQuery = function (options) {
            this.write({
                dataId: 'ROOT_QUERY',
                result: options.data,
                query: options.query,
                variables: options.variables,
            });
        };
        ApolloCache.prototype.writeFragment = function (options) {
            this.write({
                dataId: options.id,
                result: options.data,
                variables: options.variables,
                query: getFragmentQueryDocument$1(options.fragment, options.fragmentName),
            });
        };
        ApolloCache.prototype.writeData = function (_a) {
            var id = _a.id, data = _a.data;
            if (typeof id !== 'undefined') {
                var typenameResult = null;
                try {
                    typenameResult = this.read({
                        rootId: id,
                        optimistic: false,
                        query: justTypenameQuery,
                    });
                }
                catch (e) {
                }
                var __typename = (typenameResult && typenameResult.__typename) || '__ClientData';
                var dataToWrite = Object.assign({ __typename: __typename }, data);
                this.writeFragment({
                    id: id,
                    fragment: fragmentFromPojo(dataToWrite, __typename),
                    data: dataToWrite,
                });
            }
            else {
                this.writeQuery({ query: queryFromPojo(data), data: data });
            }
        };
        return ApolloCache;
    }());

    // This currentContext variable will only be used if the makeSlotClass
    // function is called, which happens only if this is the first copy of the
    // @wry/context package to be imported.
    var currentContext$1 = null;
    // This unique internal object is used to denote the absence of a value
    // for a given Slot, and is never exposed to outside code.
    var MISSING_VALUE$1 = {};
    var idCounter$1 = 1;
    // Although we can't do anything about the cost of duplicated code from
    // accidentally bundling multiple copies of the @wry/context package, we can
    // avoid creating the Slot class more than once using makeSlotClass.
    var makeSlotClass$1 = function () { return /** @class */ (function () {
        function Slot() {
            // If you have a Slot object, you can find out its slot.id, but you cannot
            // guess the slot.id of a Slot you don't have access to, thanks to the
            // randomized suffix.
            this.id = [
                "slot",
                idCounter$1++,
                Date.now(),
                Math.random().toString(36).slice(2),
            ].join(":");
        }
        Slot.prototype.hasValue = function () {
            for (var context_1 = currentContext$1; context_1; context_1 = context_1.parent) {
                // We use the Slot object iself as a key to its value, which means the
                // value cannot be obtained without a reference to the Slot object.
                if (this.id in context_1.slots) {
                    var value = context_1.slots[this.id];
                    if (value === MISSING_VALUE$1)
                        break;
                    if (context_1 !== currentContext$1) {
                        // Cache the value in currentContext.slots so the next lookup will
                        // be faster. This caching is safe because the tree of contexts and
                        // the values of the slots are logically immutable.
                        currentContext$1.slots[this.id] = value;
                    }
                    return true;
                }
            }
            if (currentContext$1) {
                // If a value was not found for this Slot, it's never going to be found
                // no matter how many times we look it up, so we might as well cache
                // the absence of the value, too.
                currentContext$1.slots[this.id] = MISSING_VALUE$1;
            }
            return false;
        };
        Slot.prototype.getValue = function () {
            if (this.hasValue()) {
                return currentContext$1.slots[this.id];
            }
        };
        Slot.prototype.withValue = function (value, callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            var _a;
            var slots = (_a = {
                    __proto__: null
                },
                _a[this.id] = value,
                _a);
            var parent = currentContext$1;
            currentContext$1 = { parent: parent, slots: slots };
            try {
                // Function.prototype.apply allows the arguments array argument to be
                // omitted or undefined, so args! is fine here.
                return callback.apply(thisArg, args);
            }
            finally {
                currentContext$1 = parent;
            }
        };
        // Capture the current context and wrap a callback function so that it
        // reestablishes the captured context when called.
        Slot.bind = function (callback) {
            var context = currentContext$1;
            return function () {
                var saved = currentContext$1;
                try {
                    currentContext$1 = context;
                    return callback.apply(this, arguments);
                }
                finally {
                    currentContext$1 = saved;
                }
            };
        };
        // Immediately run a callback function without any captured context.
        Slot.noContext = function (callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            if (currentContext$1) {
                var saved = currentContext$1;
                try {
                    currentContext$1 = null;
                    // Function.prototype.apply allows the arguments array argument to be
                    // omitted or undefined, so args! is fine here.
                    return callback.apply(thisArg, args);
                }
                finally {
                    currentContext$1 = saved;
                }
            }
            else {
                return callback.apply(thisArg, args);
            }
        };
        return Slot;
    }()); };
    // We store a single global implementation of the Slot class as a permanent
    // non-enumerable symbol property of the Array constructor. This obfuscation
    // does nothing to prevent access to the Slot class, but at least it ensures
    // the implementation (i.e. currentContext) cannot be tampered with, and all
    // copies of the @wry/context package (hopefully just one) will share the
    // same Slot implementation. Since the first copy of the @wry/context package
    // to be imported wins, this technique imposes a very high cost for any
    // future breaking changes to the Slot class.
    var globalKey$1 = "@wry/context:Slot";
    var host$1 = Array;
    var Slot$1 = host$1[globalKey$1] || function () {
        var Slot = makeSlotClass$1();
        try {
            Object.defineProperty(host$1, globalKey$1, {
                value: host$1[globalKey$1] = Slot,
                enumerable: false,
                writable: false,
                configurable: false,
            });
        }
        finally {
            return Slot;
        }
    }();

    Slot$1.bind; Slot$1.noContext;

    function defaultDispose$1() { }
    var Cache$1 = /** @class */ (function () {
        function Cache(max, dispose) {
            if (max === void 0) { max = Infinity; }
            if (dispose === void 0) { dispose = defaultDispose$1; }
            this.max = max;
            this.dispose = dispose;
            this.map = new Map();
            this.newest = null;
            this.oldest = null;
        }
        Cache.prototype.has = function (key) {
            return this.map.has(key);
        };
        Cache.prototype.get = function (key) {
            var entry = this.getEntry(key);
            return entry && entry.value;
        };
        Cache.prototype.getEntry = function (key) {
            var entry = this.map.get(key);
            if (entry && entry !== this.newest) {
                var older = entry.older, newer = entry.newer;
                if (newer) {
                    newer.older = older;
                }
                if (older) {
                    older.newer = newer;
                }
                entry.older = this.newest;
                entry.older.newer = entry;
                entry.newer = null;
                this.newest = entry;
                if (entry === this.oldest) {
                    this.oldest = newer;
                }
            }
            return entry;
        };
        Cache.prototype.set = function (key, value) {
            var entry = this.getEntry(key);
            if (entry) {
                return entry.value = value;
            }
            entry = {
                key: key,
                value: value,
                newer: null,
                older: this.newest
            };
            if (this.newest) {
                this.newest.newer = entry;
            }
            this.newest = entry;
            this.oldest = this.oldest || entry;
            this.map.set(key, entry);
            return entry.value;
        };
        Cache.prototype.clean = function () {
            while (this.oldest && this.map.size > this.max) {
                this.delete(this.oldest.key);
            }
        };
        Cache.prototype.delete = function (key) {
            var entry = this.map.get(key);
            if (entry) {
                if (entry === this.newest) {
                    this.newest = entry.older;
                }
                if (entry === this.oldest) {
                    this.oldest = entry.newer;
                }
                if (entry.newer) {
                    entry.newer.older = entry.older;
                }
                if (entry.older) {
                    entry.older.newer = entry.newer;
                }
                this.map.delete(key);
                this.dispose(entry.value, key);
                return true;
            }
            return false;
        };
        return Cache;
    }());

    var parentEntrySlot$1 = new Slot$1();

    var reusableEmptyArray = [];
    var emptySetPool$1 = [];
    var POOL_TARGET_SIZE$1 = 100;
    // Since this package might be used browsers, we should avoid using the
    // Node built-in assert module.
    function assert$1(condition, optionalMessage) {
        if (!condition) {
            throw new Error(optionalMessage || "assertion failure");
        }
    }
    function valueIs$1(a, b) {
        var len = a.length;
        return (
        // Unknown values are not equal to each other.
        len > 0 &&
            // Both values must be ordinary (or both exceptional) to be equal.
            len === b.length &&
            // The underlying value or exception must be the same.
            a[len - 1] === b[len - 1]);
    }
    function valueGet$1(value) {
        switch (value.length) {
            case 0: throw new Error("unknown value");
            case 1: return value[0];
            case 2: throw value[1];
        }
    }
    function valueCopy$1(value) {
        return value.slice(0);
    }
    var Entry$1 = /** @class */ (function () {
        function Entry(fn, args) {
            this.fn = fn;
            this.args = args;
            this.parents = new Set();
            this.childValues = new Map();
            // When this Entry has children that are dirty, this property becomes
            // a Set containing other Entry objects, borrowed from emptySetPool.
            // When the set becomes empty, it gets recycled back to emptySetPool.
            this.dirtyChildren = null;
            this.dirty = true;
            this.recomputing = false;
            this.value = [];
            ++Entry.count;
        }
        // This is the most important method of the Entry API, because it
        // determines whether the cached this.value can be returned immediately,
        // or must be recomputed. The overall performance of the caching system
        // depends on the truth of the following observations: (1) this.dirty is
        // usually false, (2) this.dirtyChildren is usually null/empty, and thus
        // (3) valueGet(this.value) is usually returned without recomputation.
        Entry.prototype.recompute = function () {
            assert$1(!this.recomputing, "already recomputing");
            if (!rememberParent$1(this) && maybeReportOrphan(this)) {
                // The recipient of the entry.reportOrphan callback decided to dispose
                // of this orphan entry by calling entry.dispose(), so we don't need to
                // (and should not) proceed with the recomputation.
                return void 0;
            }
            return mightBeDirty$1(this)
                ? reallyRecompute$1(this)
                : valueGet$1(this.value);
        };
        Entry.prototype.setDirty = function () {
            if (this.dirty)
                return;
            this.dirty = true;
            this.value.length = 0;
            reportDirty$1(this);
            // We can go ahead and unsubscribe here, since any further dirty
            // notifications we receive will be redundant, and unsubscribing may
            // free up some resources, e.g. file watchers.
            maybeUnsubscribe$1(this);
        };
        Entry.prototype.dispose = function () {
            var _this = this;
            forgetChildren$1(this).forEach(maybeReportOrphan);
            maybeUnsubscribe$1(this);
            // Because this entry has been kicked out of the cache (in index.js),
            // we've lost the ability to find out if/when this entry becomes dirty,
            // whether that happens through a subscription, because of a direct call
            // to entry.setDirty(), or because one of its children becomes dirty.
            // Because of this loss of future information, we have to assume the
            // worst (that this entry might have become dirty very soon), so we must
            // immediately mark this entry's parents as dirty. Normally we could
            // just call entry.setDirty() rather than calling parent.setDirty() for
            // each parent, but that would leave this entry in parent.childValues
            // and parent.dirtyChildren, which would prevent the child from being
            // truly forgotten.
            this.parents.forEach(function (parent) {
                parent.setDirty();
                forgetChild$1(parent, _this);
            });
        };
        Entry.count = 0;
        return Entry;
    }());
    function rememberParent$1(child) {
        var parent = parentEntrySlot$1.getValue();
        if (parent) {
            child.parents.add(parent);
            if (!parent.childValues.has(child)) {
                parent.childValues.set(child, []);
            }
            if (mightBeDirty$1(child)) {
                reportDirtyChild$1(parent, child);
            }
            else {
                reportCleanChild$1(parent, child);
            }
            return parent;
        }
    }
    function reallyRecompute$1(entry) {
        // Since this recomputation is likely to re-remember some of this
        // entry's children, we forget our children here but do not call
        // maybeReportOrphan until after the recomputation finishes.
        var originalChildren = forgetChildren$1(entry);
        // Set entry as the parent entry while calling recomputeNewValue(entry).
        parentEntrySlot$1.withValue(entry, recomputeNewValue$1, [entry]);
        if (maybeSubscribe$1(entry)) {
            // If we successfully recomputed entry.value and did not fail to
            // (re)subscribe, then this Entry is no longer explicitly dirty.
            setClean$1(entry);
        }
        // Now that we've had a chance to re-remember any children that were
        // involved in the recomputation, we can safely report any orphan
        // children that remain.
        originalChildren.forEach(maybeReportOrphan);
        return valueGet$1(entry.value);
    }
    function recomputeNewValue$1(entry) {
        entry.recomputing = true;
        // Set entry.value as unknown.
        entry.value.length = 0;
        try {
            // If entry.fn succeeds, entry.value will become a normal Value.
            entry.value[0] = entry.fn.apply(null, entry.args);
        }
        catch (e) {
            // If entry.fn throws, entry.value will become exceptional.
            entry.value[1] = e;
        }
        // Either way, this line is always reached.
        entry.recomputing = false;
    }
    function mightBeDirty$1(entry) {
        return entry.dirty || !!(entry.dirtyChildren && entry.dirtyChildren.size);
    }
    function setClean$1(entry) {
        entry.dirty = false;
        if (mightBeDirty$1(entry)) {
            // This Entry may still have dirty children, in which case we can't
            // let our parents know we're clean just yet.
            return;
        }
        reportClean$1(entry);
    }
    function reportDirty$1(child) {
        child.parents.forEach(function (parent) { return reportDirtyChild$1(parent, child); });
    }
    function reportClean$1(child) {
        child.parents.forEach(function (parent) { return reportCleanChild$1(parent, child); });
    }
    // Let a parent Entry know that one of its children may be dirty.
    function reportDirtyChild$1(parent, child) {
        // Must have called rememberParent(child) before calling
        // reportDirtyChild(parent, child).
        assert$1(parent.childValues.has(child));
        assert$1(mightBeDirty$1(child));
        if (!parent.dirtyChildren) {
            parent.dirtyChildren = emptySetPool$1.pop() || new Set;
        }
        else if (parent.dirtyChildren.has(child)) {
            // If we already know this child is dirty, then we must have already
            // informed our own parents that we are dirty, so we can terminate
            // the recursion early.
            return;
        }
        parent.dirtyChildren.add(child);
        reportDirty$1(parent);
    }
    // Let a parent Entry know that one of its children is no longer dirty.
    function reportCleanChild$1(parent, child) {
        // Must have called rememberChild(child) before calling
        // reportCleanChild(parent, child).
        assert$1(parent.childValues.has(child));
        assert$1(!mightBeDirty$1(child));
        var childValue = parent.childValues.get(child);
        if (childValue.length === 0) {
            parent.childValues.set(child, valueCopy$1(child.value));
        }
        else if (!valueIs$1(childValue, child.value)) {
            parent.setDirty();
        }
        removeDirtyChild$1(parent, child);
        if (mightBeDirty$1(parent)) {
            return;
        }
        reportClean$1(parent);
    }
    function removeDirtyChild$1(parent, child) {
        var dc = parent.dirtyChildren;
        if (dc) {
            dc.delete(child);
            if (dc.size === 0) {
                if (emptySetPool$1.length < POOL_TARGET_SIZE$1) {
                    emptySetPool$1.push(dc);
                }
                parent.dirtyChildren = null;
            }
        }
    }
    // If the given entry has a reportOrphan method, and no remaining parents,
    // call entry.reportOrphan and return true iff it returns true. The
    // reportOrphan function should return true to indicate entry.dispose()
    // has been called, and the entry has been removed from any other caches
    // (see index.js for the only current example).
    function maybeReportOrphan(entry) {
        return entry.parents.size === 0 &&
            typeof entry.reportOrphan === "function" &&
            entry.reportOrphan() === true;
    }
    // Removes all children from this entry and returns an array of the
    // removed children.
    function forgetChildren$1(parent) {
        var children = reusableEmptyArray;
        if (parent.childValues.size > 0) {
            children = [];
            parent.childValues.forEach(function (_value, child) {
                forgetChild$1(parent, child);
                children.push(child);
            });
        }
        // After we forget all our children, this.dirtyChildren must be empty
        // and therefore must have been reset to null.
        assert$1(parent.dirtyChildren === null);
        return children;
    }
    function forgetChild$1(parent, child) {
        child.parents.delete(parent);
        parent.childValues.delete(child);
        removeDirtyChild$1(parent, child);
    }
    function maybeSubscribe$1(entry) {
        if (typeof entry.subscribe === "function") {
            try {
                maybeUnsubscribe$1(entry); // Prevent double subscriptions.
                entry.unsubscribe = entry.subscribe.apply(null, entry.args);
            }
            catch (e) {
                // If this Entry has a subscribe function and it threw an exception
                // (or an unsubscribe function it previously returned now throws),
                // return false to indicate that we were not able to subscribe (or
                // unsubscribe), and this Entry should remain dirty.
                entry.setDirty();
                return false;
            }
        }
        // Returning true indicates either that there was no entry.subscribe
        // function or that it succeeded.
        return true;
    }
    function maybeUnsubscribe$1(entry) {
        var unsubscribe = entry.unsubscribe;
        if (typeof unsubscribe === "function") {
            entry.unsubscribe = void 0;
            unsubscribe();
        }
    }

    // A trie data structure that holds object keys weakly, yet can also hold
    // non-object keys, unlike the native `WeakMap`.
    var KeyTrie = /** @class */ (function () {
        function KeyTrie(weakness) {
            this.weakness = weakness;
        }
        KeyTrie.prototype.lookup = function () {
            var array = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                array[_i] = arguments[_i];
            }
            return this.lookupArray(array);
        };
        KeyTrie.prototype.lookupArray = function (array) {
            var node = this;
            array.forEach(function (key) { return node = node.getChildTrie(key); });
            return node.data || (node.data = Object.create(null));
        };
        KeyTrie.prototype.getChildTrie = function (key) {
            var map = this.weakness && isObjRef$1(key)
                ? this.weak || (this.weak = new WeakMap())
                : this.strong || (this.strong = new Map());
            var child = map.get(key);
            if (!child)
                map.set(key, child = new KeyTrie(this.weakness));
            return child;
        };
        return KeyTrie;
    }());
    function isObjRef$1(value) {
        switch (typeof value) {
            case "object":
                if (value === null)
                    break;
            // Fall through to return true...
            case "function":
                return true;
        }
        return false;
    }

    // The defaultMakeCacheKey function is remarkably powerful, because it gives
    // a unique object for any shallow-identical list of arguments. If you need
    // to implement a custom makeCacheKey function, you may find it helpful to
    // delegate the final work to defaultMakeCacheKey, which is why we export it
    // here. However, you may want to avoid defaultMakeCacheKey if your runtime
    // does not support WeakMap, or you have the ability to return a string key.
    // In those cases, just write your own custom makeCacheKey functions.
    var keyTrie$1 = new KeyTrie(typeof WeakMap === "function");
    function defaultMakeCacheKey$1() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return keyTrie$1.lookupArray(args);
    }
    var caches$1 = new Set();
    function wrap$2(originalFunction, options) {
        if (options === void 0) { options = Object.create(null); }
        var cache = new Cache$1(options.max || Math.pow(2, 16), function (entry) { return entry.dispose(); });
        var disposable = !!options.disposable;
        var makeCacheKey = options.makeCacheKey || defaultMakeCacheKey$1;
        function optimistic() {
            if (disposable && !parentEntrySlot$1.hasValue()) {
                // If there's no current parent computation, and this wrapped
                // function is disposable (meaning we don't care about entry.value,
                // just dependency tracking), then we can short-cut everything else
                // in this function, because entry.recompute() is going to recycle
                // the entry object without recomputing anything, anyway.
                return void 0;
            }
            var key = makeCacheKey.apply(null, arguments);
            if (key === void 0) {
                return originalFunction.apply(null, arguments);
            }
            var args = Array.prototype.slice.call(arguments);
            var entry = cache.get(key);
            if (entry) {
                entry.args = args;
            }
            else {
                entry = new Entry$1(originalFunction, args);
                cache.set(key, entry);
                entry.subscribe = options.subscribe;
                if (disposable) {
                    entry.reportOrphan = function () { return cache.delete(key); };
                }
            }
            var value = entry.recompute();
            // Move this entry to the front of the least-recently used queue,
            // since we just finished computing its value.
            cache.set(key, entry);
            caches$1.add(cache);
            // Clean up any excess entries in the cache, but only if there is no
            // active parent entry, meaning we're not in the middle of a larger
            // computation that might be flummoxed by the cleaning.
            if (!parentEntrySlot$1.hasValue()) {
                caches$1.forEach(function (cache) { return cache.clean(); });
                caches$1.clear();
            }
            // If options.disposable is truthy, the caller of wrap is telling us
            // they don't care about the result of entry.recompute(), so we should
            // avoid returning the value, so it won't be accidentally used.
            return disposable ? void 0 : value;
        }
        optimistic.dirty = function () {
            var key = makeCacheKey.apply(null, arguments);
            var child = key !== void 0 && cache.get(key);
            if (child) {
                child.setDirty();
            }
        };
        return optimistic;
    }

    var genericMessage$3 = "Invariant Violation";
    var _a$5 = Object.setPrototypeOf, setPrototypeOf$3 = _a$5 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$5;
    var InvariantError$3 = /** @class */ (function (_super) {
        __extends$1(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage$3; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage$3 + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage$3;
            setPrototypeOf$3(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$3(condition, message) {
        if (!condition) {
            throw new InvariantError$3(message);
        }
    }
    function wrapConsoleMethod$3(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod$3("warn");
        invariant.error = wrapConsoleMethod$3("error");
    })(invariant$3 || (invariant$3 = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub$2 = { env: {} };
    if (typeof process === "object") {
        processStub$2 = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub$2);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    var haveWarned = false;
    function shouldWarn() {
        var answer = !haveWarned;
        if (!isTest$1()) {
            haveWarned = true;
        }
        return answer;
    }
    var HeuristicFragmentMatcher = (function () {
        function HeuristicFragmentMatcher() {
        }
        HeuristicFragmentMatcher.prototype.ensureReady = function () {
            return Promise.resolve();
        };
        HeuristicFragmentMatcher.prototype.canBypassInit = function () {
            return true;
        };
        HeuristicFragmentMatcher.prototype.match = function (idValue, typeCondition, context) {
            var obj = context.store.get(idValue.id);
            var isRootQuery = idValue.id === 'ROOT_QUERY';
            if (!obj) {
                return isRootQuery;
            }
            var _a = obj.__typename, __typename = _a === void 0 ? isRootQuery && 'Query' : _a;
            if (!__typename) {
                if (shouldWarn()) {
                    process.env.NODE_ENV === "production" || invariant$3.warn("You're using fragments in your queries, but either don't have the addTypename:\n  true option set in Apollo Client, or you are trying to write a fragment to the store without the __typename.\n   Please turn on the addTypename option and include __typename when writing fragments so that Apollo Client\n   can accurately match fragments.");
                    process.env.NODE_ENV === "production" || invariant$3.warn('Could not find __typename on Fragment ', typeCondition, obj);
                    process.env.NODE_ENV === "production" || invariant$3.warn("DEPRECATION WARNING: using fragments without __typename is unsupported behavior " +
                        "and will be removed in future versions of Apollo client. You should fix this and set addTypename to true now.");
                }
                return 'heuristic';
            }
            if (__typename === typeCondition) {
                return true;
            }
            if (shouldWarn()) {
                process.env.NODE_ENV === "production" || invariant$3.error('You are using the simple (heuristic) fragment matcher, but your ' +
                    'queries contain union or interface types. Apollo Client will not be ' +
                    'able to accurately map fragments. To make this error go away, use ' +
                    'the `IntrospectionFragmentMatcher` as described in the docs: ' +
                    'https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher');
            }
            return 'heuristic';
        };
        return HeuristicFragmentMatcher;
    }());

    var hasOwn$1 = Object.prototype.hasOwnProperty;
    var DepTrackingCache = (function () {
        function DepTrackingCache(data) {
            var _this = this;
            if (data === void 0) { data = Object.create(null); }
            this.data = data;
            this.depend = wrap$2(function (dataId) { return _this.data[dataId]; }, {
                disposable: true,
                makeCacheKey: function (dataId) {
                    return dataId;
                },
            });
        }
        DepTrackingCache.prototype.toObject = function () {
            return this.data;
        };
        DepTrackingCache.prototype.get = function (dataId) {
            this.depend(dataId);
            return this.data[dataId];
        };
        DepTrackingCache.prototype.set = function (dataId, value) {
            var oldValue = this.data[dataId];
            if (value !== oldValue) {
                this.data[dataId] = value;
                this.depend.dirty(dataId);
            }
        };
        DepTrackingCache.prototype.delete = function (dataId) {
            if (hasOwn$1.call(this.data, dataId)) {
                delete this.data[dataId];
                this.depend.dirty(dataId);
            }
        };
        DepTrackingCache.prototype.clear = function () {
            this.replace(null);
        };
        DepTrackingCache.prototype.replace = function (newData) {
            var _this = this;
            if (newData) {
                Object.keys(newData).forEach(function (dataId) {
                    _this.set(dataId, newData[dataId]);
                });
                Object.keys(this.data).forEach(function (dataId) {
                    if (!hasOwn$1.call(newData, dataId)) {
                        _this.delete(dataId);
                    }
                });
            }
            else {
                Object.keys(this.data).forEach(function (dataId) {
                    _this.delete(dataId);
                });
            }
        };
        return DepTrackingCache;
    }());
    function defaultNormalizedCacheFactory(seed) {
        return new DepTrackingCache(seed);
    }

    var StoreReader$1 = (function () {
        function StoreReader(_a) {
            var _this = this;
            var _b = _a === void 0 ? {} : _a, _c = _b.cacheKeyRoot, cacheKeyRoot = _c === void 0 ? new KeyTrie(canUseWeakMap$1) : _c, _d = _b.freezeResults, freezeResults = _d === void 0 ? false : _d;
            var _e = this, executeStoreQuery = _e.executeStoreQuery, executeSelectionSet = _e.executeSelectionSet, executeSubSelectedArray = _e.executeSubSelectedArray;
            this.freezeResults = freezeResults;
            this.executeStoreQuery = wrap$2(function (options) {
                return executeStoreQuery.call(_this, options);
            }, {
                makeCacheKey: function (_a) {
                    var query = _a.query, rootValue = _a.rootValue, contextValue = _a.contextValue, variableValues = _a.variableValues, fragmentMatcher = _a.fragmentMatcher;
                    if (contextValue.store instanceof DepTrackingCache) {
                        return cacheKeyRoot.lookup(contextValue.store, query, fragmentMatcher, JSON.stringify(variableValues), rootValue.id);
                    }
                }
            });
            this.executeSelectionSet = wrap$2(function (options) {
                return executeSelectionSet.call(_this, options);
            }, {
                makeCacheKey: function (_a) {
                    var selectionSet = _a.selectionSet, rootValue = _a.rootValue, execContext = _a.execContext;
                    if (execContext.contextValue.store instanceof DepTrackingCache) {
                        return cacheKeyRoot.lookup(execContext.contextValue.store, selectionSet, execContext.fragmentMatcher, JSON.stringify(execContext.variableValues), rootValue.id);
                    }
                }
            });
            this.executeSubSelectedArray = wrap$2(function (options) {
                return executeSubSelectedArray.call(_this, options);
            }, {
                makeCacheKey: function (_a) {
                    var field = _a.field, array = _a.array, execContext = _a.execContext;
                    if (execContext.contextValue.store instanceof DepTrackingCache) {
                        return cacheKeyRoot.lookup(execContext.contextValue.store, field, array, JSON.stringify(execContext.variableValues));
                    }
                }
            });
        }
        StoreReader.prototype.readQueryFromStore = function (options) {
            return this.diffQueryAgainstStore(__assign$2(__assign$2({}, options), { returnPartialData: false })).result;
        };
        StoreReader.prototype.diffQueryAgainstStore = function (_a) {
            var store = _a.store, query = _a.query, variables = _a.variables, previousResult = _a.previousResult, _b = _a.returnPartialData, returnPartialData = _b === void 0 ? true : _b, _c = _a.rootId, rootId = _c === void 0 ? 'ROOT_QUERY' : _c, fragmentMatcherFunction = _a.fragmentMatcherFunction, config = _a.config;
            var queryDefinition = getQueryDefinition$1(query);
            variables = assign({}, getDefaultValues$1(queryDefinition), variables);
            var context = {
                store: store,
                dataIdFromObject: config && config.dataIdFromObject,
                cacheRedirects: (config && config.cacheRedirects) || {},
            };
            var execResult = this.executeStoreQuery({
                query: query,
                rootValue: {
                    type: 'id',
                    id: rootId,
                    generated: true,
                    typename: 'Query',
                },
                contextValue: context,
                variableValues: variables,
                fragmentMatcher: fragmentMatcherFunction,
            });
            var hasMissingFields = execResult.missing && execResult.missing.length > 0;
            if (hasMissingFields && !returnPartialData) {
                execResult.missing.forEach(function (info) {
                    if (info.tolerable)
                        return;
                    throw process.env.NODE_ENV === "production" ? new InvariantError$3(8) : new InvariantError$3("Can't find field " + info.fieldName + " on object " + JSON.stringify(info.object, null, 2) + ".");
                });
            }
            if (previousResult) {
                if (equal$1(previousResult, execResult.result)) {
                    execResult.result = previousResult;
                }
            }
            return {
                result: execResult.result,
                complete: !hasMissingFields,
            };
        };
        StoreReader.prototype.executeStoreQuery = function (_a) {
            var query = _a.query, rootValue = _a.rootValue, contextValue = _a.contextValue, variableValues = _a.variableValues, _b = _a.fragmentMatcher, fragmentMatcher = _b === void 0 ? defaultFragmentMatcher : _b;
            var mainDefinition = getMainDefinition$1(query);
            var fragments = getFragmentDefinitions$1(query);
            var fragmentMap = createFragmentMap$1(fragments);
            var execContext = {
                query: query,
                fragmentMap: fragmentMap,
                contextValue: contextValue,
                variableValues: variableValues,
                fragmentMatcher: fragmentMatcher,
            };
            return this.executeSelectionSet({
                selectionSet: mainDefinition.selectionSet,
                rootValue: rootValue,
                execContext: execContext,
            });
        };
        StoreReader.prototype.executeSelectionSet = function (_a) {
            var _this = this;
            var selectionSet = _a.selectionSet, rootValue = _a.rootValue, execContext = _a.execContext;
            var fragmentMap = execContext.fragmentMap, contextValue = execContext.contextValue, variables = execContext.variableValues;
            var finalResult = { result: null };
            var objectsToMerge = [];
            var object = contextValue.store.get(rootValue.id);
            var typename = (object && object.__typename) ||
                (rootValue.id === 'ROOT_QUERY' && 'Query') ||
                void 0;
            function handleMissing(result) {
                var _a;
                if (result.missing) {
                    finalResult.missing = finalResult.missing || [];
                    (_a = finalResult.missing).push.apply(_a, result.missing);
                }
                return result.result;
            }
            selectionSet.selections.forEach(function (selection) {
                var _a;
                if (!shouldInclude$1(selection, variables)) {
                    return;
                }
                if (isField$1(selection)) {
                    var fieldResult = handleMissing(_this.executeField(object, typename, selection, execContext));
                    if (typeof fieldResult !== 'undefined') {
                        objectsToMerge.push((_a = {},
                            _a[resultKeyNameFromField$1(selection)] = fieldResult,
                            _a));
                    }
                }
                else {
                    var fragment = void 0;
                    if (isInlineFragment(selection)) {
                        fragment = selection;
                    }
                    else {
                        fragment = fragmentMap[selection.name.value];
                        if (!fragment) {
                            throw process.env.NODE_ENV === "production" ? new InvariantError$3(9) : new InvariantError$3("No fragment named " + selection.name.value);
                        }
                    }
                    var typeCondition = fragment.typeCondition && fragment.typeCondition.name.value;
                    var match = !typeCondition ||
                        execContext.fragmentMatcher(rootValue, typeCondition, contextValue);
                    if (match) {
                        var fragmentExecResult = _this.executeSelectionSet({
                            selectionSet: fragment.selectionSet,
                            rootValue: rootValue,
                            execContext: execContext,
                        });
                        if (match === 'heuristic' && fragmentExecResult.missing) {
                            fragmentExecResult = __assign$2(__assign$2({}, fragmentExecResult), { missing: fragmentExecResult.missing.map(function (info) {
                                    return __assign$2(__assign$2({}, info), { tolerable: true });
                                }) });
                        }
                        objectsToMerge.push(handleMissing(fragmentExecResult));
                    }
                }
            });
            finalResult.result = mergeDeepArray$1(objectsToMerge);
            if (this.freezeResults && process.env.NODE_ENV !== 'production') {
                Object.freeze(finalResult.result);
            }
            return finalResult;
        };
        StoreReader.prototype.executeField = function (object, typename, field, execContext) {
            var variables = execContext.variableValues, contextValue = execContext.contextValue;
            var fieldName = field.name.value;
            var args = argumentsObjectFromField$1(field, variables);
            var info = {
                resultKey: resultKeyNameFromField$1(field),
                directives: getDirectiveInfoFromField(field, variables),
            };
            var readStoreResult = readStoreResolver(object, typename, fieldName, args, contextValue, info);
            if (Array.isArray(readStoreResult.result)) {
                return this.combineExecResults(readStoreResult, this.executeSubSelectedArray({
                    field: field,
                    array: readStoreResult.result,
                    execContext: execContext,
                }));
            }
            if (!field.selectionSet) {
                assertSelectionSetForIdValue$1(field, readStoreResult.result);
                if (this.freezeResults && process.env.NODE_ENV !== 'production') {
                    maybeDeepFreeze$1(readStoreResult);
                }
                return readStoreResult;
            }
            if (readStoreResult.result == null) {
                return readStoreResult;
            }
            return this.combineExecResults(readStoreResult, this.executeSelectionSet({
                selectionSet: field.selectionSet,
                rootValue: readStoreResult.result,
                execContext: execContext,
            }));
        };
        StoreReader.prototype.combineExecResults = function () {
            var execResults = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                execResults[_i] = arguments[_i];
            }
            var missing;
            execResults.forEach(function (execResult) {
                if (execResult.missing) {
                    missing = missing || [];
                    missing.push.apply(missing, execResult.missing);
                }
            });
            return {
                result: execResults.pop().result,
                missing: missing,
            };
        };
        StoreReader.prototype.executeSubSelectedArray = function (_a) {
            var _this = this;
            var field = _a.field, array = _a.array, execContext = _a.execContext;
            var missing;
            function handleMissing(childResult) {
                if (childResult.missing) {
                    missing = missing || [];
                    missing.push.apply(missing, childResult.missing);
                }
                return childResult.result;
            }
            array = array.map(function (item) {
                if (item === null) {
                    return null;
                }
                if (Array.isArray(item)) {
                    return handleMissing(_this.executeSubSelectedArray({
                        field: field,
                        array: item,
                        execContext: execContext,
                    }));
                }
                if (field.selectionSet) {
                    return handleMissing(_this.executeSelectionSet({
                        selectionSet: field.selectionSet,
                        rootValue: item,
                        execContext: execContext,
                    }));
                }
                assertSelectionSetForIdValue$1(field, item);
                return item;
            });
            if (this.freezeResults && process.env.NODE_ENV !== 'production') {
                Object.freeze(array);
            }
            return { result: array, missing: missing };
        };
        return StoreReader;
    }());
    function assertSelectionSetForIdValue$1(field, value) {
        if (!field.selectionSet && isIdValue(value)) {
            throw process.env.NODE_ENV === "production" ? new InvariantError$3(10) : new InvariantError$3("Missing selection set for object of type " + value.typename + " returned for query field " + field.name.value);
        }
    }
    function defaultFragmentMatcher() {
        return true;
    }
    function readStoreResolver(object, typename, fieldName, args, context, _a) {
        _a.resultKey; var directives = _a.directives;
        var storeKeyName = fieldName;
        if (args || directives) {
            storeKeyName = getStoreKeyName$1(storeKeyName, args, directives);
        }
        var fieldValue = void 0;
        if (object) {
            fieldValue = object[storeKeyName];
            if (typeof fieldValue === 'undefined' &&
                context.cacheRedirects &&
                typeof typename === 'string') {
                var type = context.cacheRedirects[typename];
                if (type) {
                    var resolver = type[fieldName];
                    if (resolver) {
                        fieldValue = resolver(object, args, {
                            getCacheKey: function (storeObj) {
                                var id = context.dataIdFromObject(storeObj);
                                return id && toIdValue({
                                    id: id,
                                    typename: storeObj.__typename,
                                });
                            },
                        });
                    }
                }
            }
        }
        if (typeof fieldValue === 'undefined') {
            return {
                result: fieldValue,
                missing: [{
                        object: object,
                        fieldName: storeKeyName,
                        tolerable: false,
                    }],
            };
        }
        if (isJsonValue(fieldValue)) {
            fieldValue = fieldValue.json;
        }
        return {
            result: fieldValue,
        };
    }

    var ObjectCache = (function () {
        function ObjectCache(data) {
            if (data === void 0) { data = Object.create(null); }
            this.data = data;
        }
        ObjectCache.prototype.toObject = function () {
            return this.data;
        };
        ObjectCache.prototype.get = function (dataId) {
            return this.data[dataId];
        };
        ObjectCache.prototype.set = function (dataId, value) {
            this.data[dataId] = value;
        };
        ObjectCache.prototype.delete = function (dataId) {
            this.data[dataId] = void 0;
        };
        ObjectCache.prototype.clear = function () {
            this.data = Object.create(null);
        };
        ObjectCache.prototype.replace = function (newData) {
            this.data = newData || Object.create(null);
        };
        return ObjectCache;
    }());

    var WriteError = (function (_super) {
        __extends$1(WriteError, _super);
        function WriteError() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.type = 'WriteError';
            return _this;
        }
        return WriteError;
    }(Error));
    function enhanceErrorWithDocument(error, document) {
        var enhancedError = new WriteError("Error writing result to store for query:\n " + JSON.stringify(document));
        enhancedError.message += '\n' + error.message;
        enhancedError.stack = error.stack;
        return enhancedError;
    }
    var StoreWriter$1 = (function () {
        function StoreWriter() {
        }
        StoreWriter.prototype.writeQueryToStore = function (_a) {
            var query = _a.query, result = _a.result, _b = _a.store, store = _b === void 0 ? defaultNormalizedCacheFactory() : _b, variables = _a.variables, dataIdFromObject = _a.dataIdFromObject, fragmentMatcherFunction = _a.fragmentMatcherFunction;
            return this.writeResultToStore({
                dataId: 'ROOT_QUERY',
                result: result,
                document: query,
                store: store,
                variables: variables,
                dataIdFromObject: dataIdFromObject,
                fragmentMatcherFunction: fragmentMatcherFunction,
            });
        };
        StoreWriter.prototype.writeResultToStore = function (_a) {
            var dataId = _a.dataId, result = _a.result, document = _a.document, _b = _a.store, store = _b === void 0 ? defaultNormalizedCacheFactory() : _b, variables = _a.variables, dataIdFromObject = _a.dataIdFromObject, fragmentMatcherFunction = _a.fragmentMatcherFunction;
            var operationDefinition = getOperationDefinition$1(document);
            try {
                return this.writeSelectionSetToStore({
                    result: result,
                    dataId: dataId,
                    selectionSet: operationDefinition.selectionSet,
                    context: {
                        store: store,
                        processedData: {},
                        variables: assign({}, getDefaultValues$1(operationDefinition), variables),
                        dataIdFromObject: dataIdFromObject,
                        fragmentMap: createFragmentMap$1(getFragmentDefinitions$1(document)),
                        fragmentMatcherFunction: fragmentMatcherFunction,
                    },
                });
            }
            catch (e) {
                throw enhanceErrorWithDocument(e, document);
            }
        };
        StoreWriter.prototype.writeSelectionSetToStore = function (_a) {
            var _this = this;
            var result = _a.result, dataId = _a.dataId, selectionSet = _a.selectionSet, context = _a.context;
            var variables = context.variables, store = context.store, fragmentMap = context.fragmentMap;
            selectionSet.selections.forEach(function (selection) {
                var _a;
                if (!shouldInclude$1(selection, variables)) {
                    return;
                }
                if (isField$1(selection)) {
                    var resultFieldKey = resultKeyNameFromField$1(selection);
                    var value = result[resultFieldKey];
                    if (typeof value !== 'undefined') {
                        _this.writeFieldToStore({
                            dataId: dataId,
                            value: value,
                            field: selection,
                            context: context,
                        });
                    }
                    else {
                        var isDefered = false;
                        var isClient = false;
                        if (selection.directives && selection.directives.length) {
                            isDefered = selection.directives.some(function (directive) { return directive.name && directive.name.value === 'defer'; });
                            isClient = selection.directives.some(function (directive) { return directive.name && directive.name.value === 'client'; });
                        }
                        if (!isDefered && !isClient && context.fragmentMatcherFunction) {
                            process.env.NODE_ENV === "production" || invariant$3.warn("Missing field " + resultFieldKey + " in " + JSON.stringify(result, null, 2).substring(0, 100));
                        }
                    }
                }
                else {
                    var fragment = void 0;
                    if (isInlineFragment(selection)) {
                        fragment = selection;
                    }
                    else {
                        fragment = (fragmentMap || {})[selection.name.value];
                        process.env.NODE_ENV === "production" ? invariant$3(fragment, 3) : invariant$3(fragment, "No fragment named " + selection.name.value + ".");
                    }
                    var matches = true;
                    if (context.fragmentMatcherFunction && fragment.typeCondition) {
                        var id = dataId || 'self';
                        var idValue = toIdValue({ id: id, typename: undefined });
                        var fakeContext = {
                            store: new ObjectCache((_a = {}, _a[id] = result, _a)),
                            cacheRedirects: {},
                        };
                        var match = context.fragmentMatcherFunction(idValue, fragment.typeCondition.name.value, fakeContext);
                        if (!isProduction() && match === 'heuristic') {
                            process.env.NODE_ENV === "production" || invariant$3.error('WARNING: heuristic fragment matching going on!');
                        }
                        matches = !!match;
                    }
                    if (matches) {
                        _this.writeSelectionSetToStore({
                            result: result,
                            selectionSet: fragment.selectionSet,
                            dataId: dataId,
                            context: context,
                        });
                    }
                }
            });
            return store;
        };
        StoreWriter.prototype.writeFieldToStore = function (_a) {
            var _b;
            var field = _a.field, value = _a.value, dataId = _a.dataId, context = _a.context;
            var variables = context.variables, dataIdFromObject = context.dataIdFromObject, store = context.store;
            var storeValue;
            var storeObject;
            var storeFieldName = storeKeyNameFromField$1(field, variables);
            if (!field.selectionSet || value === null) {
                storeValue =
                    value != null && typeof value === 'object'
                        ?
                            { type: 'json', json: value }
                        :
                            value;
            }
            else if (Array.isArray(value)) {
                var generatedId = dataId + "." + storeFieldName;
                storeValue = this.processArrayValue(value, generatedId, field.selectionSet, context);
            }
            else {
                var valueDataId = dataId + "." + storeFieldName;
                var generated = true;
                if (!isGeneratedId(valueDataId)) {
                    valueDataId = '$' + valueDataId;
                }
                if (dataIdFromObject) {
                    var semanticId = dataIdFromObject(value);
                    process.env.NODE_ENV === "production" ? invariant$3(!semanticId || !isGeneratedId(semanticId), 4) : invariant$3(!semanticId || !isGeneratedId(semanticId), 'IDs returned by dataIdFromObject cannot begin with the "$" character.');
                    if (semanticId ||
                        (typeof semanticId === 'number' && semanticId === 0)) {
                        valueDataId = semanticId;
                        generated = false;
                    }
                }
                if (!isDataProcessed(valueDataId, field, context.processedData)) {
                    this.writeSelectionSetToStore({
                        dataId: valueDataId,
                        result: value,
                        selectionSet: field.selectionSet,
                        context: context,
                    });
                }
                var typename = value.__typename;
                storeValue = toIdValue({ id: valueDataId, typename: typename }, generated);
                storeObject = store.get(dataId);
                var escapedId = storeObject && storeObject[storeFieldName];
                if (escapedId !== storeValue && isIdValue(escapedId)) {
                    var hadTypename = escapedId.typename !== undefined;
                    var hasTypename = typename !== undefined;
                    var typenameChanged = hadTypename && hasTypename && escapedId.typename !== typename;
                    process.env.NODE_ENV === "production" ? invariant$3(!generated || escapedId.generated || typenameChanged, 5) : invariant$3(!generated || escapedId.generated || typenameChanged, "Store error: the application attempted to write an object with no provided id but the store already contains an id of " + escapedId.id + " for this object. The selectionSet that was trying to be written is:\n" + JSON.stringify(field));
                    process.env.NODE_ENV === "production" ? invariant$3(!hadTypename || hasTypename, 6) : invariant$3(!hadTypename || hasTypename, "Store error: the application attempted to write an object with no provided typename but the store already contains an object with typename of " + escapedId.typename + " for the object of id " + escapedId.id + ". The selectionSet that was trying to be written is:\n" + JSON.stringify(field));
                    if (escapedId.generated) {
                        if (typenameChanged) {
                            if (!generated) {
                                store.delete(escapedId.id);
                            }
                        }
                        else {
                            mergeWithGenerated(escapedId.id, storeValue.id, store);
                        }
                    }
                }
            }
            storeObject = store.get(dataId);
            if (!storeObject || !equal$1(storeValue, storeObject[storeFieldName])) {
                store.set(dataId, __assign$2(__assign$2({}, storeObject), (_b = {}, _b[storeFieldName] = storeValue, _b)));
            }
        };
        StoreWriter.prototype.processArrayValue = function (value, generatedId, selectionSet, context) {
            var _this = this;
            return value.map(function (item, index) {
                if (item === null) {
                    return null;
                }
                var itemDataId = generatedId + "." + index;
                if (Array.isArray(item)) {
                    return _this.processArrayValue(item, itemDataId, selectionSet, context);
                }
                var generated = true;
                if (context.dataIdFromObject) {
                    var semanticId = context.dataIdFromObject(item);
                    if (semanticId) {
                        itemDataId = semanticId;
                        generated = false;
                    }
                }
                if (!isDataProcessed(itemDataId, selectionSet, context.processedData)) {
                    _this.writeSelectionSetToStore({
                        dataId: itemDataId,
                        result: item,
                        selectionSet: selectionSet,
                        context: context,
                    });
                }
                return toIdValue({ id: itemDataId, typename: item.__typename }, generated);
            });
        };
        return StoreWriter;
    }());
    function isGeneratedId(id) {
        return id[0] === '$';
    }
    function mergeWithGenerated(generatedKey, realKey, cache) {
        if (generatedKey === realKey) {
            return false;
        }
        var generated = cache.get(generatedKey);
        var real = cache.get(realKey);
        var madeChanges = false;
        Object.keys(generated).forEach(function (key) {
            var value = generated[key];
            var realValue = real[key];
            if (isIdValue(value) &&
                isGeneratedId(value.id) &&
                isIdValue(realValue) &&
                !equal$1(value, realValue) &&
                mergeWithGenerated(value.id, realValue.id, cache)) {
                madeChanges = true;
            }
        });
        cache.delete(generatedKey);
        var newRealValue = __assign$2(__assign$2({}, generated), real);
        if (equal$1(newRealValue, real)) {
            return madeChanges;
        }
        cache.set(realKey, newRealValue);
        return true;
    }
    function isDataProcessed(dataId, field, processedData) {
        if (!processedData) {
            return false;
        }
        if (processedData[dataId]) {
            if (processedData[dataId].indexOf(field) >= 0) {
                return true;
            }
            else {
                processedData[dataId].push(field);
            }
        }
        else {
            processedData[dataId] = [field];
        }
        return false;
    }

    var defaultConfig$1 = {
        fragmentMatcher: new HeuristicFragmentMatcher(),
        dataIdFromObject: defaultDataIdFromObject$1,
        addTypename: true,
        resultCaching: true,
        freezeResults: false,
    };
    function defaultDataIdFromObject$1(result) {
        if (result.__typename) {
            if (result.id !== undefined) {
                return result.__typename + ":" + result.id;
            }
            if (result._id !== undefined) {
                return result.__typename + ":" + result._id;
            }
        }
        return null;
    }
    var hasOwn$1$1 = Object.prototype.hasOwnProperty;
    var OptimisticCacheLayer = (function (_super) {
        __extends$1(OptimisticCacheLayer, _super);
        function OptimisticCacheLayer(optimisticId, parent, transaction) {
            var _this = _super.call(this, Object.create(null)) || this;
            _this.optimisticId = optimisticId;
            _this.parent = parent;
            _this.transaction = transaction;
            return _this;
        }
        OptimisticCacheLayer.prototype.toObject = function () {
            return __assign$2(__assign$2({}, this.parent.toObject()), this.data);
        };
        OptimisticCacheLayer.prototype.get = function (dataId) {
            return hasOwn$1$1.call(this.data, dataId)
                ? this.data[dataId]
                : this.parent.get(dataId);
        };
        return OptimisticCacheLayer;
    }(ObjectCache));
    var InMemoryCache = (function (_super) {
        __extends$1(InMemoryCache, _super);
        function InMemoryCache(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this) || this;
            _this.watches = new Set();
            _this.typenameDocumentCache = new Map();
            _this.cacheKeyRoot = new KeyTrie(canUseWeakMap$1);
            _this.silenceBroadcast = false;
            _this.config = __assign$2(__assign$2({}, defaultConfig$1), config);
            if (_this.config.customResolvers) {
                process.env.NODE_ENV === "production" || invariant$3.warn('customResolvers have been renamed to cacheRedirects. Please update your config as we will be deprecating customResolvers in the next major version.');
                _this.config.cacheRedirects = _this.config.customResolvers;
            }
            if (_this.config.cacheResolvers) {
                process.env.NODE_ENV === "production" || invariant$3.warn('cacheResolvers have been renamed to cacheRedirects. Please update your config as we will be deprecating cacheResolvers in the next major version.');
                _this.config.cacheRedirects = _this.config.cacheResolvers;
            }
            _this.addTypename = !!_this.config.addTypename;
            _this.data = _this.config.resultCaching
                ? new DepTrackingCache()
                : new ObjectCache();
            _this.optimisticData = _this.data;
            _this.storeWriter = new StoreWriter$1();
            _this.storeReader = new StoreReader$1({
                cacheKeyRoot: _this.cacheKeyRoot,
                freezeResults: config.freezeResults,
            });
            var cache = _this;
            var maybeBroadcastWatch = cache.maybeBroadcastWatch;
            _this.maybeBroadcastWatch = wrap$2(function (c) {
                return maybeBroadcastWatch.call(_this, c);
            }, {
                makeCacheKey: function (c) {
                    if (c.optimistic) {
                        return;
                    }
                    if (c.previousResult) {
                        return;
                    }
                    if (cache.data instanceof DepTrackingCache) {
                        return cache.cacheKeyRoot.lookup(c.query, JSON.stringify(c.variables));
                    }
                }
            });
            return _this;
        }
        InMemoryCache.prototype.restore = function (data) {
            if (data)
                this.data.replace(data);
            return this;
        };
        InMemoryCache.prototype.extract = function (optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return (optimistic ? this.optimisticData : this.data).toObject();
        };
        InMemoryCache.prototype.read = function (options) {
            if (typeof options.rootId === 'string' &&
                typeof this.data.get(options.rootId) === 'undefined') {
                return null;
            }
            var fragmentMatcher = this.config.fragmentMatcher;
            var fragmentMatcherFunction = fragmentMatcher && fragmentMatcher.match;
            return this.storeReader.readQueryFromStore({
                store: options.optimistic ? this.optimisticData : this.data,
                query: this.transformDocument(options.query),
                variables: options.variables,
                rootId: options.rootId,
                fragmentMatcherFunction: fragmentMatcherFunction,
                previousResult: options.previousResult,
                config: this.config,
            }) || null;
        };
        InMemoryCache.prototype.write = function (write) {
            var fragmentMatcher = this.config.fragmentMatcher;
            var fragmentMatcherFunction = fragmentMatcher && fragmentMatcher.match;
            this.storeWriter.writeResultToStore({
                dataId: write.dataId,
                result: write.result,
                variables: write.variables,
                document: this.transformDocument(write.query),
                store: this.data,
                dataIdFromObject: this.config.dataIdFromObject,
                fragmentMatcherFunction: fragmentMatcherFunction,
            });
            this.broadcastWatches();
        };
        InMemoryCache.prototype.diff = function (query) {
            var fragmentMatcher = this.config.fragmentMatcher;
            var fragmentMatcherFunction = fragmentMatcher && fragmentMatcher.match;
            return this.storeReader.diffQueryAgainstStore({
                store: query.optimistic ? this.optimisticData : this.data,
                query: this.transformDocument(query.query),
                variables: query.variables,
                returnPartialData: query.returnPartialData,
                previousResult: query.previousResult,
                fragmentMatcherFunction: fragmentMatcherFunction,
                config: this.config,
            });
        };
        InMemoryCache.prototype.watch = function (watch) {
            var _this = this;
            this.watches.add(watch);
            return function () {
                _this.watches.delete(watch);
            };
        };
        InMemoryCache.prototype.evict = function (query) {
            throw process.env.NODE_ENV === "production" ? new InvariantError$3(7) : new InvariantError$3("eviction is not implemented on InMemory Cache");
        };
        InMemoryCache.prototype.reset = function () {
            this.data.clear();
            this.broadcastWatches();
            return Promise.resolve();
        };
        InMemoryCache.prototype.removeOptimistic = function (idToRemove) {
            var toReapply = [];
            var removedCount = 0;
            var layer = this.optimisticData;
            while (layer instanceof OptimisticCacheLayer) {
                if (layer.optimisticId === idToRemove) {
                    ++removedCount;
                }
                else {
                    toReapply.push(layer);
                }
                layer = layer.parent;
            }
            if (removedCount > 0) {
                this.optimisticData = layer;
                while (toReapply.length > 0) {
                    var layer_1 = toReapply.pop();
                    this.performTransaction(layer_1.transaction, layer_1.optimisticId);
                }
                this.broadcastWatches();
            }
        };
        InMemoryCache.prototype.performTransaction = function (transaction, optimisticId) {
            var _a = this, data = _a.data, silenceBroadcast = _a.silenceBroadcast;
            this.silenceBroadcast = true;
            if (typeof optimisticId === 'string') {
                this.data = this.optimisticData = new OptimisticCacheLayer(optimisticId, this.optimisticData, transaction);
            }
            try {
                transaction(this);
            }
            finally {
                this.silenceBroadcast = silenceBroadcast;
                this.data = data;
            }
            this.broadcastWatches();
        };
        InMemoryCache.prototype.recordOptimisticTransaction = function (transaction, id) {
            return this.performTransaction(transaction, id);
        };
        InMemoryCache.prototype.transformDocument = function (document) {
            if (this.addTypename) {
                var result = this.typenameDocumentCache.get(document);
                if (!result) {
                    result = addTypenameToDocument$1(document);
                    this.typenameDocumentCache.set(document, result);
                    this.typenameDocumentCache.set(result, result);
                }
                return result;
            }
            return document;
        };
        InMemoryCache.prototype.broadcastWatches = function () {
            var _this = this;
            if (!this.silenceBroadcast) {
                this.watches.forEach(function (c) { return _this.maybeBroadcastWatch(c); });
            }
        };
        InMemoryCache.prototype.maybeBroadcastWatch = function (c) {
            c.callback(this.diff({
                query: c.query,
                variables: c.variables,
                previousResult: c.previousResult && c.previousResult(),
                optimistic: c.optimistic,
            }));
        };
        return InMemoryCache;
    }(ApolloCache$1));

    /**
     * Produces the value of a block string from its parsed raw value, similar to
     * CoffeeScript's block string, Python's docstring trim or Ruby's strip_heredoc.
     *
     * This implements the GraphQL spec's BlockStringValue() static algorithm.
     *
     * @internal
     */
    function dedentBlockStringValue(rawString) {
      // Expand a block string's raw value into independent lines.
      var lines = rawString.split(/\r\n|[\n\r]/g); // Remove common indentation from all lines but first.

      var commonIndent = getBlockStringIndentation(rawString);

      if (commonIndent !== 0) {
        for (var i = 1; i < lines.length; i++) {
          lines[i] = lines[i].slice(commonIndent);
        }
      } // Remove leading and trailing blank lines.


      var startLine = 0;

      while (startLine < lines.length && isBlank(lines[startLine])) {
        ++startLine;
      }

      var endLine = lines.length;

      while (endLine > startLine && isBlank(lines[endLine - 1])) {
        --endLine;
      } // Return a string of the lines joined with U+000A.


      return lines.slice(startLine, endLine).join('\n');
    }

    function isBlank(str) {
      for (var i = 0; i < str.length; ++i) {
        if (str[i] !== ' ' && str[i] !== '\t') {
          return false;
        }
      }

      return true;
    }
    /**
     * @internal
     */


    function getBlockStringIndentation(value) {
      var _commonIndent;

      var isFirstLine = true;
      var isEmptyLine = true;
      var indent = 0;
      var commonIndent = null;

      for (var i = 0; i < value.length; ++i) {
        switch (value.charCodeAt(i)) {
          case 13:
            //  \r
            if (value.charCodeAt(i + 1) === 10) {
              ++i; // skip \r\n as one symbol
            }

          // falls through

          case 10:
            //  \n
            isFirstLine = false;
            isEmptyLine = true;
            indent = 0;
            break;

          case 9: //   \t

          case 32:
            //  <space>
            ++indent;
            break;

          default:
            if (isEmptyLine && !isFirstLine && (commonIndent === null || indent < commonIndent)) {
              commonIndent = indent;
            }

            isEmptyLine = false;
        }
      }

      return (_commonIndent = commonIndent) !== null && _commonIndent !== void 0 ? _commonIndent : 0;
    }
    /**
     * Print a block string in the indented block form by adding a leading and
     * trailing blank line. However, if a block string starts with whitespace and is
     * a single-line, adding a leading blank line would strip that whitespace.
     *
     * @internal
     */

    function printBlockString(value) {
      var indentation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var preferMultipleLines = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var isSingleLine = value.indexOf('\n') === -1;
      var hasLeadingSpace = value[0] === ' ' || value[0] === '\t';
      var hasTrailingQuote = value[value.length - 1] === '"';
      var hasTrailingSlash = value[value.length - 1] === '\\';
      var printAsMultipleLines = !isSingleLine || hasTrailingQuote || hasTrailingSlash || preferMultipleLines;
      var result = ''; // Format a multi-line block quote to account for leading space.

      if (printAsMultipleLines && !(isSingleLine && hasLeadingSpace)) {
        result += '\n' + indentation;
      }

      result += indentation ? value.replace(/\n/g, '\n' + indentation) : value;

      if (printAsMultipleLines) {
        result += '\n';
      }

      return '"""' + result.replace(/"""/g, '\\"""') + '"""';
    }

    /**
     * Converts an AST into a string, using one set of reasonable
     * formatting rules.
     */

    function print(ast) {
      return visit(ast, {
        leave: printDocASTReducer
      });
    }
    var MAX_LINE_LENGTH = 80; // TODO: provide better type coverage in future

    var printDocASTReducer = {
      Name: function Name(node) {
        return node.value;
      },
      Variable: function Variable(node) {
        return '$' + node.name;
      },
      // Document
      Document: function Document(node) {
        return join(node.definitions, '\n\n') + '\n';
      },
      OperationDefinition: function OperationDefinition(node) {
        var op = node.operation;
        var name = node.name;
        var varDefs = wrap$1('(', join(node.variableDefinitions, ', '), ')');
        var directives = join(node.directives, ' ');
        var selectionSet = node.selectionSet; // Anonymous queries with no directives or variable definitions can use
        // the query short form.

        return !name && !directives && !varDefs && op === 'query' ? selectionSet : join([op, join([name, varDefs]), directives, selectionSet], ' ');
      },
      VariableDefinition: function VariableDefinition(_ref) {
        var variable = _ref.variable,
            type = _ref.type,
            defaultValue = _ref.defaultValue,
            directives = _ref.directives;
        return variable + ': ' + type + wrap$1(' = ', defaultValue) + wrap$1(' ', join(directives, ' '));
      },
      SelectionSet: function SelectionSet(_ref2) {
        var selections = _ref2.selections;
        return block(selections);
      },
      Field: function Field(_ref3) {
        var alias = _ref3.alias,
            name = _ref3.name,
            args = _ref3.arguments,
            directives = _ref3.directives,
            selectionSet = _ref3.selectionSet;
        var prefix = wrap$1('', alias, ': ') + name;
        var argsLine = prefix + wrap$1('(', join(args, ', '), ')');

        if (argsLine.length > MAX_LINE_LENGTH) {
          argsLine = prefix + wrap$1('(\n', indent(join(args, '\n')), '\n)');
        }

        return join([argsLine, join(directives, ' '), selectionSet], ' ');
      },
      Argument: function Argument(_ref4) {
        var name = _ref4.name,
            value = _ref4.value;
        return name + ': ' + value;
      },
      // Fragments
      FragmentSpread: function FragmentSpread(_ref5) {
        var name = _ref5.name,
            directives = _ref5.directives;
        return '...' + name + wrap$1(' ', join(directives, ' '));
      },
      InlineFragment: function InlineFragment(_ref6) {
        var typeCondition = _ref6.typeCondition,
            directives = _ref6.directives,
            selectionSet = _ref6.selectionSet;
        return join(['...', wrap$1('on ', typeCondition), join(directives, ' '), selectionSet], ' ');
      },
      FragmentDefinition: function FragmentDefinition(_ref7) {
        var name = _ref7.name,
            typeCondition = _ref7.typeCondition,
            variableDefinitions = _ref7.variableDefinitions,
            directives = _ref7.directives,
            selectionSet = _ref7.selectionSet;
        return (// Note: fragment variable definitions are experimental and may be changed
          // or removed in the future.
          "fragment ".concat(name).concat(wrap$1('(', join(variableDefinitions, ', '), ')'), " ") + "on ".concat(typeCondition, " ").concat(wrap$1('', join(directives, ' '), ' ')) + selectionSet
        );
      },
      // Value
      IntValue: function IntValue(_ref8) {
        var value = _ref8.value;
        return value;
      },
      FloatValue: function FloatValue(_ref9) {
        var value = _ref9.value;
        return value;
      },
      StringValue: function StringValue(_ref10, key) {
        var value = _ref10.value,
            isBlockString = _ref10.block;
        return isBlockString ? printBlockString(value, key === 'description' ? '' : '  ') : JSON.stringify(value);
      },
      BooleanValue: function BooleanValue(_ref11) {
        var value = _ref11.value;
        return value ? 'true' : 'false';
      },
      NullValue: function NullValue() {
        return 'null';
      },
      EnumValue: function EnumValue(_ref12) {
        var value = _ref12.value;
        return value;
      },
      ListValue: function ListValue(_ref13) {
        var values = _ref13.values;
        return '[' + join(values, ', ') + ']';
      },
      ObjectValue: function ObjectValue(_ref14) {
        var fields = _ref14.fields;
        return '{' + join(fields, ', ') + '}';
      },
      ObjectField: function ObjectField(_ref15) {
        var name = _ref15.name,
            value = _ref15.value;
        return name + ': ' + value;
      },
      // Directive
      Directive: function Directive(_ref16) {
        var name = _ref16.name,
            args = _ref16.arguments;
        return '@' + name + wrap$1('(', join(args, ', '), ')');
      },
      // Type
      NamedType: function NamedType(_ref17) {
        var name = _ref17.name;
        return name;
      },
      ListType: function ListType(_ref18) {
        var type = _ref18.type;
        return '[' + type + ']';
      },
      NonNullType: function NonNullType(_ref19) {
        var type = _ref19.type;
        return type + '!';
      },
      // Type System Definitions
      SchemaDefinition: addDescription(function (_ref20) {
        var directives = _ref20.directives,
            operationTypes = _ref20.operationTypes;
        return join(['schema', join(directives, ' '), block(operationTypes)], ' ');
      }),
      OperationTypeDefinition: function OperationTypeDefinition(_ref21) {
        var operation = _ref21.operation,
            type = _ref21.type;
        return operation + ': ' + type;
      },
      ScalarTypeDefinition: addDescription(function (_ref22) {
        var name = _ref22.name,
            directives = _ref22.directives;
        return join(['scalar', name, join(directives, ' ')], ' ');
      }),
      ObjectTypeDefinition: addDescription(function (_ref23) {
        var name = _ref23.name,
            interfaces = _ref23.interfaces,
            directives = _ref23.directives,
            fields = _ref23.fields;
        return join(['type', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      }),
      FieldDefinition: addDescription(function (_ref24) {
        var name = _ref24.name,
            args = _ref24.arguments,
            type = _ref24.type,
            directives = _ref24.directives;
        return name + (hasMultilineItems(args) ? wrap$1('(\n', indent(join(args, '\n')), '\n)') : wrap$1('(', join(args, ', '), ')')) + ': ' + type + wrap$1(' ', join(directives, ' '));
      }),
      InputValueDefinition: addDescription(function (_ref25) {
        var name = _ref25.name,
            type = _ref25.type,
            defaultValue = _ref25.defaultValue,
            directives = _ref25.directives;
        return join([name + ': ' + type, wrap$1('= ', defaultValue), join(directives, ' ')], ' ');
      }),
      InterfaceTypeDefinition: addDescription(function (_ref26) {
        var name = _ref26.name,
            interfaces = _ref26.interfaces,
            directives = _ref26.directives,
            fields = _ref26.fields;
        return join(['interface', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      }),
      UnionTypeDefinition: addDescription(function (_ref27) {
        var name = _ref27.name,
            directives = _ref27.directives,
            types = _ref27.types;
        return join(['union', name, join(directives, ' '), types && types.length !== 0 ? '= ' + join(types, ' | ') : ''], ' ');
      }),
      EnumTypeDefinition: addDescription(function (_ref28) {
        var name = _ref28.name,
            directives = _ref28.directives,
            values = _ref28.values;
        return join(['enum', name, join(directives, ' '), block(values)], ' ');
      }),
      EnumValueDefinition: addDescription(function (_ref29) {
        var name = _ref29.name,
            directives = _ref29.directives;
        return join([name, join(directives, ' ')], ' ');
      }),
      InputObjectTypeDefinition: addDescription(function (_ref30) {
        var name = _ref30.name,
            directives = _ref30.directives,
            fields = _ref30.fields;
        return join(['input', name, join(directives, ' '), block(fields)], ' ');
      }),
      DirectiveDefinition: addDescription(function (_ref31) {
        var name = _ref31.name,
            args = _ref31.arguments,
            repeatable = _ref31.repeatable,
            locations = _ref31.locations;
        return 'directive @' + name + (hasMultilineItems(args) ? wrap$1('(\n', indent(join(args, '\n')), '\n)') : wrap$1('(', join(args, ', '), ')')) + (repeatable ? ' repeatable' : '') + ' on ' + join(locations, ' | ');
      }),
      SchemaExtension: function SchemaExtension(_ref32) {
        var directives = _ref32.directives,
            operationTypes = _ref32.operationTypes;
        return join(['extend schema', join(directives, ' '), block(operationTypes)], ' ');
      },
      ScalarTypeExtension: function ScalarTypeExtension(_ref33) {
        var name = _ref33.name,
            directives = _ref33.directives;
        return join(['extend scalar', name, join(directives, ' ')], ' ');
      },
      ObjectTypeExtension: function ObjectTypeExtension(_ref34) {
        var name = _ref34.name,
            interfaces = _ref34.interfaces,
            directives = _ref34.directives,
            fields = _ref34.fields;
        return join(['extend type', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      },
      InterfaceTypeExtension: function InterfaceTypeExtension(_ref35) {
        var name = _ref35.name,
            interfaces = _ref35.interfaces,
            directives = _ref35.directives,
            fields = _ref35.fields;
        return join(['extend interface', name, wrap$1('implements ', join(interfaces, ' & ')), join(directives, ' '), block(fields)], ' ');
      },
      UnionTypeExtension: function UnionTypeExtension(_ref36) {
        var name = _ref36.name,
            directives = _ref36.directives,
            types = _ref36.types;
        return join(['extend union', name, join(directives, ' '), types && types.length !== 0 ? '= ' + join(types, ' | ') : ''], ' ');
      },
      EnumTypeExtension: function EnumTypeExtension(_ref37) {
        var name = _ref37.name,
            directives = _ref37.directives,
            values = _ref37.values;
        return join(['extend enum', name, join(directives, ' '), block(values)], ' ');
      },
      InputObjectTypeExtension: function InputObjectTypeExtension(_ref38) {
        var name = _ref38.name,
            directives = _ref38.directives,
            fields = _ref38.fields;
        return join(['extend input', name, join(directives, ' '), block(fields)], ' ');
      }
    };

    function addDescription(cb) {
      return function (node) {
        return join([node.description, cb(node)], '\n');
      };
    }
    /**
     * Given maybeArray, print an empty string if it is null or empty, otherwise
     * print all items together separated by separator if provided
     */


    function join(maybeArray) {
      var _maybeArray$filter$jo;

      var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return (_maybeArray$filter$jo = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.filter(function (x) {
        return x;
      }).join(separator)) !== null && _maybeArray$filter$jo !== void 0 ? _maybeArray$filter$jo : '';
    }
    /**
     * Given array, print each item on its own line, wrapped in an
     * indented "{ }" block.
     */


    function block(array) {
      return wrap$1('{\n', indent(join(array, '\n')), '\n}');
    }
    /**
     * If maybeString is not null or empty, then wrap with start and end, otherwise print an empty string.
     */


    function wrap$1(start, maybeString) {
      var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      return maybeString != null && maybeString !== '' ? start + maybeString + end : '';
    }

    function indent(str) {
      return wrap$1('  ', str.replace(/\n/g, '\n  '));
    }

    function isMultiline(str) {
      return str.indexOf('\n') !== -1;
    }

    function hasMultilineItems(maybeArray) {
      return maybeArray != null && maybeArray.some(isMultiline);
    }

    var genericMessage$2 = "Invariant Violation";
    var _a$4 = Object.setPrototypeOf, setPrototypeOf$2 = _a$4 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$4;
    var InvariantError$2 = /** @class */ (function (_super) {
        __extends$1(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage$2; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage$2 + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage$2;
            setPrototypeOf$2(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$2(condition, message) {
        if (!condition) {
            throw new InvariantError$2(message);
        }
    }
    function wrapConsoleMethod$2(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod$2("warn");
        invariant.error = wrapConsoleMethod$2("error");
    })(invariant$2 || (invariant$2 = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub$1 = { env: {} };
    if (typeof process === "object") {
        processStub$1 = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub$1);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    var defaultHttpOptions$1 = {
        includeQuery: true,
        includeExtensions: false,
    };
    var defaultHeaders$1 = {
        accept: '*/*',
        'content-type': 'application/json',
    };
    var defaultOptions$1 = {
        method: 'POST',
    };
    var fallbackHttpConfig$1 = {
        http: defaultHttpOptions$1,
        headers: defaultHeaders$1,
        options: defaultOptions$1,
    };
    var throwServerError$1 = function (response, result, message) {
        var error = new Error(message);
        error.name = 'ServerError';
        error.response = response;
        error.statusCode = response.status;
        error.result = result;
        throw error;
    };
    var parseAndCheckHttpResponse$1 = function (operations) { return function (response) {
        return (response
            .text()
            .then(function (bodyText) {
            try {
                return JSON.parse(bodyText);
            }
            catch (err) {
                var parseError = err;
                parseError.name = 'ServerParseError';
                parseError.response = response;
                parseError.statusCode = response.status;
                parseError.bodyText = bodyText;
                return Promise.reject(parseError);
            }
        })
            .then(function (result) {
            if (response.status >= 300) {
                throwServerError$1(response, result, "Response not successful: Received status code " + response.status);
            }
            if (!Array.isArray(result) &&
                !result.hasOwnProperty('data') &&
                !result.hasOwnProperty('errors')) {
                throwServerError$1(response, result, "Server response was missing for query '" + (Array.isArray(operations)
                    ? operations.map(function (op) { return op.operationName; })
                    : operations.operationName) + "'.");
            }
            return result;
        }));
    }; };
    var checkFetcher$1 = function (fetcher) {
        if (!fetcher && typeof fetch === 'undefined') {
            var library = 'unfetch';
            if (typeof window === 'undefined')
                library = 'node-fetch';
            throw process.env.NODE_ENV === "production" ? new InvariantError$2(1) : new InvariantError$2("\nfetch is not found globally and no fetcher passed, to fix pass a fetch for\nyour environment like https://www.npmjs.com/package/" + library + ".\n\nFor example:\nimport fetch from '" + library + "';\nimport { createHttpLink } from 'apollo-link-http';\n\nconst link = createHttpLink({ uri: '/graphql', fetch: fetch });");
        }
    };
    var createSignalIfSupported$1 = function () {
        if (typeof AbortController === 'undefined')
            return { controller: false, signal: false };
        var controller = new AbortController();
        var signal = controller.signal;
        return { controller: controller, signal: signal };
    };
    var selectHttpOptionsAndBody$1 = function (operation, fallbackConfig) {
        var configs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            configs[_i - 2] = arguments[_i];
        }
        var options = __assign$2({}, fallbackConfig.options, { headers: fallbackConfig.headers, credentials: fallbackConfig.credentials });
        var http = fallbackConfig.http;
        configs.forEach(function (config) {
            options = __assign$2({}, options, config.options, { headers: __assign$2({}, options.headers, config.headers) });
            if (config.credentials)
                options.credentials = config.credentials;
            http = __assign$2({}, http, config.http);
        });
        var operationName = operation.operationName, extensions = operation.extensions, variables = operation.variables, query = operation.query;
        var body = { operationName: operationName, variables: variables };
        if (http.includeExtensions)
            body.extensions = extensions;
        if (http.includeQuery)
            body.query = print(query);
        return {
            options: options,
            body: body,
        };
    };
    var serializeFetchParameter$1 = function (p, label) {
        var serialized;
        try {
            serialized = JSON.stringify(p);
        }
        catch (e) {
            var parseError = process.env.NODE_ENV === "production" ? new InvariantError$2(2) : new InvariantError$2("Network request failed. " + label + " is not serializable: " + e.message);
            parseError.parseError = e;
            throw parseError;
        }
        return serialized;
    };
    var selectURI$1 = function (operation, fallbackURI) {
        var context = operation.getContext();
        var contextURI = context.uri;
        if (contextURI) {
            return contextURI;
        }
        else if (typeof fallbackURI === 'function') {
            return fallbackURI(operation);
        }
        else {
            return fallbackURI || '/graphql';
        }
    };

    var createHttpLink$1 = function (linkOptions) {
        if (linkOptions === void 0) { linkOptions = {}; }
        var _a = linkOptions.uri, uri = _a === void 0 ? '/graphql' : _a, fetcher = linkOptions.fetch, includeExtensions = linkOptions.includeExtensions, useGETForQueries = linkOptions.useGETForQueries, requestOptions = __rest(linkOptions, ["uri", "fetch", "includeExtensions", "useGETForQueries"]);
        checkFetcher$1(fetcher);
        if (!fetcher) {
            fetcher = fetch;
        }
        var linkConfig = {
            http: { includeExtensions: includeExtensions },
            options: requestOptions.fetchOptions,
            credentials: requestOptions.credentials,
            headers: requestOptions.headers,
        };
        return new ApolloLink$1(function (operation) {
            var chosenURI = selectURI$1(operation, uri);
            var context = operation.getContext();
            var clientAwarenessHeaders = {};
            if (context.clientAwareness) {
                var _a = context.clientAwareness, name_1 = _a.name, version = _a.version;
                if (name_1) {
                    clientAwarenessHeaders['apollographql-client-name'] = name_1;
                }
                if (version) {
                    clientAwarenessHeaders['apollographql-client-version'] = version;
                }
            }
            var contextHeaders = __assign$2({}, clientAwarenessHeaders, context.headers);
            var contextConfig = {
                http: context.http,
                options: context.fetchOptions,
                credentials: context.credentials,
                headers: contextHeaders,
            };
            var _b = selectHttpOptionsAndBody$1(operation, fallbackHttpConfig$1, linkConfig, contextConfig), options = _b.options, body = _b.body;
            var controller;
            if (!options.signal) {
                var _c = createSignalIfSupported$1(), _controller = _c.controller, signal = _c.signal;
                controller = _controller;
                if (controller)
                    options.signal = signal;
            }
            var definitionIsMutation = function (d) {
                return d.kind === 'OperationDefinition' && d.operation === 'mutation';
            };
            if (useGETForQueries &&
                !operation.query.definitions.some(definitionIsMutation)) {
                options.method = 'GET';
            }
            if (options.method === 'GET') {
                var _d = rewriteURIForGET$1(chosenURI, body), newURI = _d.newURI, parseError = _d.parseError;
                if (parseError) {
                    return fromError$1(parseError);
                }
                chosenURI = newURI;
            }
            else {
                try {
                    options.body = serializeFetchParameter$1(body, 'Payload');
                }
                catch (parseError) {
                    return fromError$1(parseError);
                }
            }
            return new Observable$1(function (observer) {
                fetcher(chosenURI, options)
                    .then(function (response) {
                    operation.setContext({ response: response });
                    return response;
                })
                    .then(parseAndCheckHttpResponse$1(operation))
                    .then(function (result) {
                    observer.next(result);
                    observer.complete();
                    return result;
                })
                    .catch(function (err) {
                    if (err.name === 'AbortError')
                        return;
                    if (err.result && err.result.errors && err.result.data) {
                        observer.next(err.result);
                    }
                    observer.error(err);
                });
                return function () {
                    if (controller)
                        controller.abort();
                };
            });
        });
    };
    function rewriteURIForGET$1(chosenURI, body) {
        var queryParams = [];
        var addQueryParam = function (key, value) {
            queryParams.push(key + "=" + encodeURIComponent(value));
        };
        if ('query' in body) {
            addQueryParam('query', body.query);
        }
        if (body.operationName) {
            addQueryParam('operationName', body.operationName);
        }
        if (body.variables) {
            var serializedVariables = void 0;
            try {
                serializedVariables = serializeFetchParameter$1(body.variables, 'Variables map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('variables', serializedVariables);
        }
        if (body.extensions) {
            var serializedExtensions = void 0;
            try {
                serializedExtensions = serializeFetchParameter$1(body.extensions, 'Extensions map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('extensions', serializedExtensions);
        }
        var fragment = '', preFragment = chosenURI;
        var fragmentStart = chosenURI.indexOf('#');
        if (fragmentStart !== -1) {
            fragment = chosenURI.substr(fragmentStart);
            preFragment = chosenURI.substr(0, fragmentStart);
        }
        var queryParamsPrefix = preFragment.indexOf('?') === -1 ? '?' : '&';
        var newURI = preFragment + queryParamsPrefix + queryParams.join('&') + fragment;
        return { newURI: newURI };
    }
    var HttpLink = (function (_super) {
        __extends$1(HttpLink, _super);
        function HttpLink(opts) {
            return _super.call(this, createHttpLink$1(opts).request) || this;
        }
        return HttpLink;
    }(ApolloLink$1));

    function onError(errorHandler) {
        return new ApolloLink$1(function (operation, forward) {
            return new Observable$1(function (observer) {
                var sub;
                var retriedSub;
                var retriedResult;
                try {
                    sub = forward(operation).subscribe({
                        next: function (result) {
                            if (result.errors) {
                                retriedResult = errorHandler({
                                    graphQLErrors: result.errors,
                                    response: result,
                                    operation: operation,
                                    forward: forward,
                                });
                                if (retriedResult) {
                                    retriedSub = retriedResult.subscribe({
                                        next: observer.next.bind(observer),
                                        error: observer.error.bind(observer),
                                        complete: observer.complete.bind(observer),
                                    });
                                    return;
                                }
                            }
                            observer.next(result);
                        },
                        error: function (networkError) {
                            retriedResult = errorHandler({
                                operation: operation,
                                networkError: networkError,
                                graphQLErrors: networkError &&
                                    networkError.result &&
                                    networkError.result.errors,
                                forward: forward,
                            });
                            if (retriedResult) {
                                retriedSub = retriedResult.subscribe({
                                    next: observer.next.bind(observer),
                                    error: observer.error.bind(observer),
                                    complete: observer.complete.bind(observer),
                                });
                                return;
                            }
                            observer.error(networkError);
                        },
                        complete: function () {
                            if (!retriedResult) {
                                observer.complete.bind(observer)();
                            }
                        },
                    });
                }
                catch (e) {
                    errorHandler({ networkError: e, operation: operation, forward: forward });
                    observer.error(e);
                }
                return function () {
                    if (sub)
                        sub.unsubscribe();
                    if (retriedSub)
                        sub.unsubscribe();
                };
            });
        });
    }
    ((function (_super) {
        __extends$1(ErrorLink, _super);
        function ErrorLink(errorHandler) {
            var _this = _super.call(this) || this;
            _this.link = onError(errorHandler);
            return _this;
        }
        ErrorLink.prototype.request = function (operation, forward) {
            return this.link.request(operation, forward);
        };
        return ErrorLink;
    })(ApolloLink$1));

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign$1 = function() {
        __assign$1 = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign$1.apply(this, arguments);
    };

    function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }

    /**
     * Return true if `value` is object-like. A value is object-like if it's not
     * `null` and has a `typeof` result of "object".
     */
    function isObjectLike(value) {
      return _typeof$1(value) == 'object' && value !== null;
    }

    // In ES2015 (or a polyfilled) environment, this will be Symbol.iterator

    var SYMBOL_TO_STRING_TAG = typeof Symbol === 'function' && Symbol.toStringTag != null ? Symbol.toStringTag : '@@toStringTag';

    /**
     * Represents a location in a Source.
     */

    /**
     * Takes a Source and a UTF-8 character offset, and returns the corresponding
     * line and column as a SourceLocation.
     */
    function getLocation(source, position) {
      var lineRegexp = /\r\n|[\n\r]/g;
      var line = 1;
      var column = position + 1;
      var match;

      while ((match = lineRegexp.exec(source.body)) && match.index < position) {
        line += 1;
        column = position + 1 - (match.index + match[0].length);
      }

      return {
        line: line,
        column: column
      };
    }

    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printLocation(location) {
      return printSourceLocation(location.source, getLocation(location.source, location.start));
    }
    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printSourceLocation(source, sourceLocation) {
      var firstLineColumnOffset = source.locationOffset.column - 1;
      var body = whitespace(firstLineColumnOffset) + source.body;
      var lineIndex = sourceLocation.line - 1;
      var lineOffset = source.locationOffset.line - 1;
      var lineNum = sourceLocation.line + lineOffset;
      var columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
      var columnNum = sourceLocation.column + columnOffset;
      var locationStr = "".concat(source.name, ":").concat(lineNum, ":").concat(columnNum, "\n");
      var lines = body.split(/\r\n|[\n\r]/g);
      var locationLine = lines[lineIndex]; // Special case for minified documents

      if (locationLine.length > 120) {
        var subLineIndex = Math.floor(columnNum / 80);
        var subLineColumnNum = columnNum % 80;
        var subLines = [];

        for (var i = 0; i < locationLine.length; i += 80) {
          subLines.push(locationLine.slice(i, i + 80));
        }

        return locationStr + printPrefixedLines([["".concat(lineNum), subLines[0]]].concat(subLines.slice(1, subLineIndex + 1).map(function (subLine) {
          return ['', subLine];
        }), [[' ', whitespace(subLineColumnNum - 1) + '^'], ['', subLines[subLineIndex + 1]]]));
      }

      return locationStr + printPrefixedLines([// Lines specified like this: ["prefix", "string"],
      ["".concat(lineNum - 1), lines[lineIndex - 1]], ["".concat(lineNum), locationLine], ['', whitespace(columnNum - 1) + '^'], ["".concat(lineNum + 1), lines[lineIndex + 1]]]);
    }

    function printPrefixedLines(lines) {
      var existingLines = lines.filter(function (_ref) {
        _ref[0];
            var line = _ref[1];
        return line !== undefined;
      });
      var padLen = Math.max.apply(Math, existingLines.map(function (_ref2) {
        var prefix = _ref2[0];
        return prefix.length;
      }));
      return existingLines.map(function (_ref3) {
        var prefix = _ref3[0],
            line = _ref3[1];
        return leftPad(padLen, prefix) + (line ? ' | ' + line : ' |');
      }).join('\n');
    }

    function whitespace(len) {
      return Array(len + 1).join(' ');
    }

    function leftPad(len, str) {
      return whitespace(len - str.length) + str;
    }

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

    function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
    /**
     * A GraphQLError describes an Error found during the parse, validate, or
     * execute phases of performing a GraphQL operation. In addition to a message
     * and stack trace, it also includes information about the locations in a
     * GraphQL document and/or execution result that correspond to the Error.
     */

    var GraphQLError = /*#__PURE__*/function (_Error) {
      _inherits(GraphQLError, _Error);

      var _super = _createSuper(GraphQLError);

      /**
       * A message describing the Error for debugging purposes.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       *
       * Note: should be treated as readonly, despite invariant usage.
       */

      /**
       * An array of { line, column } locations within the source GraphQL document
       * which correspond to this error.
       *
       * Errors during validation often contain multiple locations, for example to
       * point out two things with the same name. Errors during execution include a
       * single location, the field which produced the error.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array describing the JSON-path into the execution response which
       * corresponds to this error. Only included for errors during execution.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array of GraphQL AST Nodes corresponding to this error.
       */

      /**
       * The source GraphQL document for the first location of this error.
       *
       * Note that if this Error represents more than one node, the source may not
       * represent nodes after the first node.
       */

      /**
       * An array of character offsets within the source GraphQL document
       * which correspond to this error.
       */

      /**
       * The original error thrown from a field resolver during execution.
       */

      /**
       * Extension fields to add to the formatted error.
       */
      function GraphQLError(message, nodes, source, positions, path, originalError, extensions) {
        var _locations2, _source2, _positions2, _extensions2;

        var _this;

        _classCallCheck(this, GraphQLError);

        _this = _super.call(this, message); // Compute list of blame nodes.

        var _nodes = Array.isArray(nodes) ? nodes.length !== 0 ? nodes : undefined : nodes ? [nodes] : undefined; // Compute locations in the source for the given nodes/positions.


        var _source = source;

        if (!_source && _nodes) {
          var _nodes$0$loc;

          _source = (_nodes$0$loc = _nodes[0].loc) === null || _nodes$0$loc === void 0 ? void 0 : _nodes$0$loc.source;
        }

        var _positions = positions;

        if (!_positions && _nodes) {
          _positions = _nodes.reduce(function (list, node) {
            if (node.loc) {
              list.push(node.loc.start);
            }

            return list;
          }, []);
        }

        if (_positions && _positions.length === 0) {
          _positions = undefined;
        }

        var _locations;

        if (positions && source) {
          _locations = positions.map(function (pos) {
            return getLocation(source, pos);
          });
        } else if (_nodes) {
          _locations = _nodes.reduce(function (list, node) {
            if (node.loc) {
              list.push(getLocation(node.loc.source, node.loc.start));
            }

            return list;
          }, []);
        }

        var _extensions = extensions;

        if (_extensions == null && originalError != null) {
          var originalExtensions = originalError.extensions;

          if (isObjectLike(originalExtensions)) {
            _extensions = originalExtensions;
          }
        }

        Object.defineProperties(_assertThisInitialized(_this), {
          name: {
            value: 'GraphQLError'
          },
          message: {
            value: message,
            // By being enumerable, JSON.stringify will include `message` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: true,
            writable: true
          },
          locations: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: (_locations2 = _locations) !== null && _locations2 !== void 0 ? _locations2 : undefined,
            // By being enumerable, JSON.stringify will include `locations` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: _locations != null
          },
          path: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: path !== null && path !== void 0 ? path : undefined,
            // By being enumerable, JSON.stringify will include `path` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: path != null
          },
          nodes: {
            value: _nodes !== null && _nodes !== void 0 ? _nodes : undefined
          },
          source: {
            value: (_source2 = _source) !== null && _source2 !== void 0 ? _source2 : undefined
          },
          positions: {
            value: (_positions2 = _positions) !== null && _positions2 !== void 0 ? _positions2 : undefined
          },
          originalError: {
            value: originalError
          },
          extensions: {
            // Coercing falsy values to undefined ensures they will not be included
            // in JSON.stringify() when not provided.
            value: (_extensions2 = _extensions) !== null && _extensions2 !== void 0 ? _extensions2 : undefined,
            // By being enumerable, JSON.stringify will include `path` in the
            // resulting output. This ensures that the simplest possible GraphQL
            // service adheres to the spec.
            enumerable: _extensions != null
          }
        }); // Include (non-enumerable) stack trace.

        if (originalError !== null && originalError !== void 0 && originalError.stack) {
          Object.defineProperty(_assertThisInitialized(_this), 'stack', {
            value: originalError.stack,
            writable: true,
            configurable: true
          });
          return _possibleConstructorReturn(_this);
        } // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2317')


        if (Error.captureStackTrace) {
          Error.captureStackTrace(_assertThisInitialized(_this), GraphQLError);
        } else {
          Object.defineProperty(_assertThisInitialized(_this), 'stack', {
            value: Error().stack,
            writable: true,
            configurable: true
          });
        }

        return _this;
      }

      _createClass$1(GraphQLError, [{
        key: "toString",
        value: function toString() {
          return printError(this);
        } // FIXME: workaround to not break chai comparisons, should be remove in v16
        // $FlowFixMe[unsupported-syntax] Flow doesn't support computed properties yet

      }, {
        key: SYMBOL_TO_STRING_TAG,
        get: function get() {
          return 'Object';
        }
      }]);

      return GraphQLError;
    }( /*#__PURE__*/_wrapNativeSuper(Error));
    /**
     * Prints a GraphQLError to a string, representing useful location information
     * about the error's position in the source.
     */

    function printError(error) {
      var output = error.message;

      if (error.nodes) {
        for (var _i2 = 0, _error$nodes2 = error.nodes; _i2 < _error$nodes2.length; _i2++) {
          var node = _error$nodes2[_i2];

          if (node.loc) {
            output += '\n\n' + printLocation(node.loc);
          }
        }
      } else if (error.source && error.locations) {
        for (var _i4 = 0, _error$locations2 = error.locations; _i4 < _error$locations2.length; _i4++) {
          var location = _error$locations2[_i4];
          output += '\n\n' + printSourceLocation(error.source, location);
        }
      }

      return output;
    }

    /**
     * Produces a GraphQLError representing a syntax error, containing useful
     * descriptive information about the syntax error's position in the source.
     */

    function syntaxError(source, position, description) {
      return new GraphQLError("Syntax Error: ".concat(description), undefined, source, [position]);
    }

    /**
     * The set of allowed kind values for AST nodes.
     */
    var Kind = Object.freeze({
      // Name
      NAME: 'Name',
      // Document
      DOCUMENT: 'Document',
      OPERATION_DEFINITION: 'OperationDefinition',
      VARIABLE_DEFINITION: 'VariableDefinition',
      SELECTION_SET: 'SelectionSet',
      FIELD: 'Field',
      ARGUMENT: 'Argument',
      // Fragments
      FRAGMENT_SPREAD: 'FragmentSpread',
      INLINE_FRAGMENT: 'InlineFragment',
      FRAGMENT_DEFINITION: 'FragmentDefinition',
      // Values
      VARIABLE: 'Variable',
      INT: 'IntValue',
      FLOAT: 'FloatValue',
      STRING: 'StringValue',
      BOOLEAN: 'BooleanValue',
      NULL: 'NullValue',
      ENUM: 'EnumValue',
      LIST: 'ListValue',
      OBJECT: 'ObjectValue',
      OBJECT_FIELD: 'ObjectField',
      // Directives
      DIRECTIVE: 'Directive',
      // Types
      NAMED_TYPE: 'NamedType',
      LIST_TYPE: 'ListType',
      NON_NULL_TYPE: 'NonNullType',
      // Type System Definitions
      SCHEMA_DEFINITION: 'SchemaDefinition',
      OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',
      // Type Definitions
      SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
      OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
      FIELD_DEFINITION: 'FieldDefinition',
      INPUT_VALUE_DEFINITION: 'InputValueDefinition',
      INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
      UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
      ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
      ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
      INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',
      // Directive Definitions
      DIRECTIVE_DEFINITION: 'DirectiveDefinition',
      // Type System Extensions
      SCHEMA_EXTENSION: 'SchemaExtension',
      // Type Extensions
      SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
      OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
      INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
      UNION_TYPE_EXTENSION: 'UnionTypeExtension',
      ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
      INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension'
    });
    /**
     * The enum type representing the possible kind values of AST nodes.
     */

    /**
     * An exported enum describing the different kinds of tokens that the
     * lexer emits.
     */
    var TokenKind = Object.freeze({
      SOF: '<SOF>',
      EOF: '<EOF>',
      BANG: '!',
      DOLLAR: '$',
      AMP: '&',
      PAREN_L: '(',
      PAREN_R: ')',
      SPREAD: '...',
      COLON: ':',
      EQUALS: '=',
      AT: '@',
      BRACKET_L: '[',
      BRACKET_R: ']',
      BRACE_L: '{',
      PIPE: '|',
      BRACE_R: '}',
      NAME: 'Name',
      INT: 'Int',
      FLOAT: 'Float',
      STRING: 'String',
      BLOCK_STRING: 'BlockString',
      COMMENT: 'Comment'
    });
    /**
     * The enum type representing the token kinds values.
     */

    function devAssert(condition, message) {
      var booleanCondition = Boolean(condition); // istanbul ignore else (See transformation done in './resources/inlineInvariant.js')

      if (!booleanCondition) {
        throw new Error(message);
      }
    }

    /**
     * A replacement for instanceof which includes an error warning when multi-realm
     * constructors are detected.
     */
    // See: https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
    // See: https://webpack.js.org/guides/production/
    var instanceOf = process.env.NODE_ENV === 'production' ? // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2317')
    // eslint-disable-next-line no-shadow
    function instanceOf(value, constructor) {
      return value instanceof constructor;
    } : // eslint-disable-next-line no-shadow
    function instanceOf(value, constructor) {
      if (value instanceof constructor) {
        return true;
      }

      if (value) {
        var valueClass = value.constructor;
        var className = constructor.name;

        if (className && valueClass && valueClass.name === className) {
          throw new Error("Cannot use ".concat(className, " \"").concat(value, "\" from another module or realm.\n\nEnsure that there is only one instance of \"graphql\" in the node_modules\ndirectory. If different versions of \"graphql\" are the dependencies of other\nrelied on modules, use \"resolutions\" to ensure only one version is installed.\n\nhttps://yarnpkg.com/en/docs/selective-version-resolutions\n\nDuplicate \"graphql\" modules cannot be used at the same time since different\nversions may have different capabilities and behavior. The data from one\nversion used in the function from another could produce confusing and\nspurious results."));
        }
      }

      return false;
    };

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * A representation of source input to GraphQL. The `name` and `locationOffset` parameters are
     * optional, but they are useful for clients who store GraphQL documents in source files.
     * For example, if the GraphQL input starts at line 40 in a file named `Foo.graphql`, it might
     * be useful for `name` to be `"Foo.graphql"` and location to be `{ line: 40, column: 1 }`.
     * The `line` and `column` properties in `locationOffset` are 1-indexed.
     */
    var Source = /*#__PURE__*/function () {
      function Source(body) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GraphQL request';
        var locationOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
          line: 1,
          column: 1
        };
        typeof body === 'string' || devAssert(0, "Body must be a string. Received: ".concat(inspect(body), "."));
        this.body = body;
        this.name = name;
        this.locationOffset = locationOffset;
        this.locationOffset.line > 0 || devAssert(0, 'line in locationOffset is 1-indexed and must be positive.');
        this.locationOffset.column > 0 || devAssert(0, 'column in locationOffset is 1-indexed and must be positive.');
      } // $FlowFixMe[unsupported-syntax] Flow doesn't support computed properties yet


      _createClass(Source, [{
        key: SYMBOL_TO_STRING_TAG,
        get: function get() {
          return 'Source';
        }
      }]);

      return Source;
    }();
    /**
     * Test if the given value is a Source object.
     *
     * @internal
     */

    // eslint-disable-next-line no-redeclare
    function isSource(source) {
      return instanceOf(source, Source);
    }

    /**
     * The set of allowed directive location values.
     */
    var DirectiveLocation = Object.freeze({
      // Request Definitions
      QUERY: 'QUERY',
      MUTATION: 'MUTATION',
      SUBSCRIPTION: 'SUBSCRIPTION',
      FIELD: 'FIELD',
      FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION',
      FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',
      INLINE_FRAGMENT: 'INLINE_FRAGMENT',
      VARIABLE_DEFINITION: 'VARIABLE_DEFINITION',
      // Type System Definitions
      SCHEMA: 'SCHEMA',
      SCALAR: 'SCALAR',
      OBJECT: 'OBJECT',
      FIELD_DEFINITION: 'FIELD_DEFINITION',
      ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
      INTERFACE: 'INTERFACE',
      UNION: 'UNION',
      ENUM: 'ENUM',
      ENUM_VALUE: 'ENUM_VALUE',
      INPUT_OBJECT: 'INPUT_OBJECT',
      INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'
    });
    /**
     * The enum type representing the directive location values.
     */

    /**
     * Given a Source object, creates a Lexer for that source.
     * A Lexer is a stateful stream generator in that every time
     * it is advanced, it returns the next token in the Source. Assuming the
     * source lexes, the final Token emitted by the lexer will be of kind
     * EOF, after which the lexer will repeatedly return the same EOF token
     * whenever called.
     */

    var Lexer = /*#__PURE__*/function () {
      /**
       * The previously focused non-ignored token.
       */

      /**
       * The currently focused non-ignored token.
       */

      /**
       * The (1-indexed) line containing the current token.
       */

      /**
       * The character offset at which the current line begins.
       */
      function Lexer(source) {
        var startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0, null);
        this.source = source;
        this.lastToken = startOfFileToken;
        this.token = startOfFileToken;
        this.line = 1;
        this.lineStart = 0;
      }
      /**
       * Advances the token stream to the next non-ignored token.
       */


      var _proto = Lexer.prototype;

      _proto.advance = function advance() {
        this.lastToken = this.token;
        var token = this.token = this.lookahead();
        return token;
      }
      /**
       * Looks ahead and returns the next non-ignored token, but does not change
       * the state of Lexer.
       */
      ;

      _proto.lookahead = function lookahead() {
        var token = this.token;

        if (token.kind !== TokenKind.EOF) {
          do {
            var _token$next;

            // Note: next is only mutable during parsing, so we cast to allow this.
            token = (_token$next = token.next) !== null && _token$next !== void 0 ? _token$next : token.next = readToken(this, token);
          } while (token.kind === TokenKind.COMMENT);
        }

        return token;
      };

      return Lexer;
    }();
    /**
     * @internal
     */

    function isPunctuatorTokenKind(kind) {
      return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
    }

    function printCharCode(code) {
      return (// NaN/undefined represents access beyond the end of the file.
        isNaN(code) ? TokenKind.EOF : // Trust JSON for ASCII.
        code < 0x007f ? JSON.stringify(String.fromCharCode(code)) : // Otherwise print the escaped form.
        "\"\\u".concat(('00' + code.toString(16).toUpperCase()).slice(-4), "\"")
      );
    }
    /**
     * Gets the next token from the source starting at the given position.
     *
     * This skips over whitespace until it finds the next lexable token, then lexes
     * punctuators immediately or calls the appropriate helper function for more
     * complicated tokens.
     */


    function readToken(lexer, prev) {
      var source = lexer.source;
      var body = source.body;
      var bodyLength = body.length;
      var pos = prev.end;

      while (pos < bodyLength) {
        var code = body.charCodeAt(pos);
        var _line = lexer.line;

        var _col = 1 + pos - lexer.lineStart; // SourceCharacter


        switch (code) {
          case 0xfeff: // <BOM>

          case 9: //   \t

          case 32: //  <space>

          case 44:
            //  ,
            ++pos;
            continue;

          case 10:
            //  \n
            ++pos;
            ++lexer.line;
            lexer.lineStart = pos;
            continue;

          case 13:
            //  \r
            if (body.charCodeAt(pos + 1) === 10) {
              pos += 2;
            } else {
              ++pos;
            }

            ++lexer.line;
            lexer.lineStart = pos;
            continue;

          case 33:
            //  !
            return new Token(TokenKind.BANG, pos, pos + 1, _line, _col, prev);

          case 35:
            //  #
            return readComment(source, pos, _line, _col, prev);

          case 36:
            //  $
            return new Token(TokenKind.DOLLAR, pos, pos + 1, _line, _col, prev);

          case 38:
            //  &
            return new Token(TokenKind.AMP, pos, pos + 1, _line, _col, prev);

          case 40:
            //  (
            return new Token(TokenKind.PAREN_L, pos, pos + 1, _line, _col, prev);

          case 41:
            //  )
            return new Token(TokenKind.PAREN_R, pos, pos + 1, _line, _col, prev);

          case 46:
            //  .
            if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
              return new Token(TokenKind.SPREAD, pos, pos + 3, _line, _col, prev);
            }

            break;

          case 58:
            //  :
            return new Token(TokenKind.COLON, pos, pos + 1, _line, _col, prev);

          case 61:
            //  =
            return new Token(TokenKind.EQUALS, pos, pos + 1, _line, _col, prev);

          case 64:
            //  @
            return new Token(TokenKind.AT, pos, pos + 1, _line, _col, prev);

          case 91:
            //  [
            return new Token(TokenKind.BRACKET_L, pos, pos + 1, _line, _col, prev);

          case 93:
            //  ]
            return new Token(TokenKind.BRACKET_R, pos, pos + 1, _line, _col, prev);

          case 123:
            // {
            return new Token(TokenKind.BRACE_L, pos, pos + 1, _line, _col, prev);

          case 124:
            // |
            return new Token(TokenKind.PIPE, pos, pos + 1, _line, _col, prev);

          case 125:
            // }
            return new Token(TokenKind.BRACE_R, pos, pos + 1, _line, _col, prev);

          case 34:
            //  "
            if (body.charCodeAt(pos + 1) === 34 && body.charCodeAt(pos + 2) === 34) {
              return readBlockString(source, pos, _line, _col, prev, lexer);
            }

            return readString(source, pos, _line, _col, prev);

          case 45: //  -

          case 48: //  0

          case 49: //  1

          case 50: //  2

          case 51: //  3

          case 52: //  4

          case 53: //  5

          case 54: //  6

          case 55: //  7

          case 56: //  8

          case 57:
            //  9
            return readNumber(source, pos, code, _line, _col, prev);

          case 65: //  A

          case 66: //  B

          case 67: //  C

          case 68: //  D

          case 69: //  E

          case 70: //  F

          case 71: //  G

          case 72: //  H

          case 73: //  I

          case 74: //  J

          case 75: //  K

          case 76: //  L

          case 77: //  M

          case 78: //  N

          case 79: //  O

          case 80: //  P

          case 81: //  Q

          case 82: //  R

          case 83: //  S

          case 84: //  T

          case 85: //  U

          case 86: //  V

          case 87: //  W

          case 88: //  X

          case 89: //  Y

          case 90: //  Z

          case 95: //  _

          case 97: //  a

          case 98: //  b

          case 99: //  c

          case 100: // d

          case 101: // e

          case 102: // f

          case 103: // g

          case 104: // h

          case 105: // i

          case 106: // j

          case 107: // k

          case 108: // l

          case 109: // m

          case 110: // n

          case 111: // o

          case 112: // p

          case 113: // q

          case 114: // r

          case 115: // s

          case 116: // t

          case 117: // u

          case 118: // v

          case 119: // w

          case 120: // x

          case 121: // y

          case 122:
            // z
            return readName(source, pos, _line, _col, prev);
        }

        throw syntaxError(source, pos, unexpectedCharacterMessage(code));
      }

      var line = lexer.line;
      var col = 1 + pos - lexer.lineStart;
      return new Token(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
    }
    /**
     * Report a message that an unexpected character was encountered.
     */


    function unexpectedCharacterMessage(code) {
      if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
        return "Cannot contain the invalid character ".concat(printCharCode(code), ".");
      }

      if (code === 39) {
        // '
        return 'Unexpected single quote character (\'), did you mean to use a double quote (")?';
      }

      return "Cannot parse the unexpected character ".concat(printCharCode(code), ".");
    }
    /**
     * Reads a comment token from the source file.
     *
     * #[\u0009\u0020-\uFFFF]*
     */


    function readComment(source, start, line, col, prev) {
      var body = source.body;
      var code;
      var position = start;

      do {
        code = body.charCodeAt(++position);
      } while (!isNaN(code) && ( // SourceCharacter but not LineTerminator
      code > 0x001f || code === 0x0009));

      return new Token(TokenKind.COMMENT, start, position, line, col, prev, body.slice(start + 1, position));
    }
    /**
     * Reads a number token from the source file, either a float
     * or an int depending on whether a decimal point appears.
     *
     * Int:   -?(0|[1-9][0-9]*)
     * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
     */


    function readNumber(source, start, firstCode, line, col, prev) {
      var body = source.body;
      var code = firstCode;
      var position = start;
      var isFloat = false;

      if (code === 45) {
        // -
        code = body.charCodeAt(++position);
      }

      if (code === 48) {
        // 0
        code = body.charCodeAt(++position);

        if (code >= 48 && code <= 57) {
          throw syntaxError(source, position, "Invalid number, unexpected digit after 0: ".concat(printCharCode(code), "."));
        }
      } else {
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      }

      if (code === 46) {
        // .
        isFloat = true;
        code = body.charCodeAt(++position);
        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      }

      if (code === 69 || code === 101) {
        // E e
        isFloat = true;
        code = body.charCodeAt(++position);

        if (code === 43 || code === 45) {
          // + -
          code = body.charCodeAt(++position);
        }

        position = readDigits(source, position, code);
        code = body.charCodeAt(position);
      } // Numbers cannot be followed by . or NameStart


      if (code === 46 || isNameStart(code)) {
        throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
      }

      return new Token(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, line, col, prev, body.slice(start, position));
    }
    /**
     * Returns the new position in the source after reading digits.
     */


    function readDigits(source, start, firstCode) {
      var body = source.body;
      var position = start;
      var code = firstCode;

      if (code >= 48 && code <= 57) {
        // 0 - 9
        do {
          code = body.charCodeAt(++position);
        } while (code >= 48 && code <= 57); // 0 - 9


        return position;
      }

      throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
    }
    /**
     * Reads a string token from the source file.
     *
     * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
     */


    function readString(source, start, line, col, prev) {
      var body = source.body;
      var position = start + 1;
      var chunkStart = position;
      var code = 0;
      var value = '';

      while (position < body.length && !isNaN(code = body.charCodeAt(position)) && // not LineTerminator
      code !== 0x000a && code !== 0x000d) {
        // Closing Quote (")
        if (code === 34) {
          value += body.slice(chunkStart, position);
          return new Token(TokenKind.STRING, start, position + 1, line, col, prev, value);
        } // SourceCharacter


        if (code < 0x0020 && code !== 0x0009) {
          throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
        }

        ++position;

        if (code === 92) {
          // \
          value += body.slice(chunkStart, position - 1);
          code = body.charCodeAt(position);

          switch (code) {
            case 34:
              value += '"';
              break;

            case 47:
              value += '/';
              break;

            case 92:
              value += '\\';
              break;

            case 98:
              value += '\b';
              break;

            case 102:
              value += '\f';
              break;

            case 110:
              value += '\n';
              break;

            case 114:
              value += '\r';
              break;

            case 116:
              value += '\t';
              break;

            case 117:
              {
                // uXXXX
                var charCode = uniCharCode(body.charCodeAt(position + 1), body.charCodeAt(position + 2), body.charCodeAt(position + 3), body.charCodeAt(position + 4));

                if (charCode < 0) {
                  var invalidSequence = body.slice(position + 1, position + 5);
                  throw syntaxError(source, position, "Invalid character escape sequence: \\u".concat(invalidSequence, "."));
                }

                value += String.fromCharCode(charCode);
                position += 4;
                break;
              }

            default:
              throw syntaxError(source, position, "Invalid character escape sequence: \\".concat(String.fromCharCode(code), "."));
          }

          ++position;
          chunkStart = position;
        }
      }

      throw syntaxError(source, position, 'Unterminated string.');
    }
    /**
     * Reads a block string token from the source file.
     *
     * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
     */


    function readBlockString(source, start, line, col, prev, lexer) {
      var body = source.body;
      var position = start + 3;
      var chunkStart = position;
      var code = 0;
      var rawValue = '';

      while (position < body.length && !isNaN(code = body.charCodeAt(position))) {
        // Closing Triple-Quote (""")
        if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          rawValue += body.slice(chunkStart, position);
          return new Token(TokenKind.BLOCK_STRING, start, position + 3, line, col, prev, dedentBlockStringValue(rawValue));
        } // SourceCharacter


        if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
          throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
        }

        if (code === 10) {
          // new line
          ++position;
          ++lexer.line;
          lexer.lineStart = position;
        } else if (code === 13) {
          // carriage return
          if (body.charCodeAt(position + 1) === 10) {
            position += 2;
          } else {
            ++position;
          }

          ++lexer.line;
          lexer.lineStart = position;
        } else if ( // Escape Triple-Quote (\""")
        code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
          rawValue += body.slice(chunkStart, position) + '"""';
          position += 4;
          chunkStart = position;
        } else {
          ++position;
        }
      }

      throw syntaxError(source, position, 'Unterminated string.');
    }
    /**
     * Converts four hexadecimal chars to the integer that the
     * string represents. For example, uniCharCode('0','0','0','f')
     * will return 15, and uniCharCode('0','0','f','f') returns 255.
     *
     * Returns a negative number on error, if a char was invalid.
     *
     * This is implemented by noting that char2hex() returns -1 on error,
     * which means the result of ORing the char2hex() will also be negative.
     */


    function uniCharCode(a, b, c, d) {
      return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
    }
    /**
     * Converts a hex character to its integer value.
     * '0' becomes 0, '9' becomes 9
     * 'A' becomes 10, 'F' becomes 15
     * 'a' becomes 10, 'f' becomes 15
     *
     * Returns -1 on error.
     */


    function char2hex(a) {
      return a >= 48 && a <= 57 ? a - 48 // 0-9
      : a >= 65 && a <= 70 ? a - 55 // A-F
      : a >= 97 && a <= 102 ? a - 87 // a-f
      : -1;
    }
    /**
     * Reads an alphanumeric + underscore name from the source.
     *
     * [_A-Za-z][_0-9A-Za-z]*
     */


    function readName(source, start, line, col, prev) {
      var body = source.body;
      var bodyLength = body.length;
      var position = start + 1;
      var code = 0;

      while (position !== bodyLength && !isNaN(code = body.charCodeAt(position)) && (code === 95 || // _
      code >= 48 && code <= 57 || // 0-9
      code >= 65 && code <= 90 || // A-Z
      code >= 97 && code <= 122) // a-z
      ) {
        ++position;
      }

      return new Token(TokenKind.NAME, start, position, line, col, prev, body.slice(start, position));
    } // _ A-Z a-z


    function isNameStart(code) {
      return code === 95 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
    }

    /**
     * Configuration options to control parser behavior
     */

    /**
     * Given a GraphQL source, parses it into a Document.
     * Throws GraphQLError if a syntax error is encountered.
     */
    function parse(source, options) {
      var parser = new Parser(source, options);
      return parser.parseDocument();
    }
    /**
     * This class is exported only to assist people in implementing their own parsers
     * without duplicating too much code and should be used only as last resort for cases
     * such as experimental syntax or if certain features could not be contributed upstream.
     *
     * It is still part of the internal API and is versioned, so any changes to it are never
     * considered breaking changes. If you still need to support multiple versions of the
     * library, please use the `versionInfo` variable for version detection.
     *
     * @internal
     */

    var Parser = /*#__PURE__*/function () {
      function Parser(source, options) {
        var sourceObj = isSource(source) ? source : new Source(source);
        this._lexer = new Lexer(sourceObj);
        this._options = options;
      }
      /**
       * Converts a name lex token into a name parse node.
       */


      var _proto = Parser.prototype;

      _proto.parseName = function parseName() {
        var token = this.expectToken(TokenKind.NAME);
        return {
          kind: Kind.NAME,
          value: token.value,
          loc: this.loc(token)
        };
      } // Implements the parsing rules in the Document section.

      /**
       * Document : Definition+
       */
      ;

      _proto.parseDocument = function parseDocument() {
        var start = this._lexer.token;
        return {
          kind: Kind.DOCUMENT,
          definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
          loc: this.loc(start)
        };
      }
      /**
       * Definition :
       *   - ExecutableDefinition
       *   - TypeSystemDefinition
       *   - TypeSystemExtension
       *
       * ExecutableDefinition :
       *   - OperationDefinition
       *   - FragmentDefinition
       */
      ;

      _proto.parseDefinition = function parseDefinition() {
        if (this.peek(TokenKind.NAME)) {
          switch (this._lexer.token.value) {
            case 'query':
            case 'mutation':
            case 'subscription':
              return this.parseOperationDefinition();

            case 'fragment':
              return this.parseFragmentDefinition();

            case 'schema':
            case 'scalar':
            case 'type':
            case 'interface':
            case 'union':
            case 'enum':
            case 'input':
            case 'directive':
              return this.parseTypeSystemDefinition();

            case 'extend':
              return this.parseTypeSystemExtension();
          }
        } else if (this.peek(TokenKind.BRACE_L)) {
          return this.parseOperationDefinition();
        } else if (this.peekDescription()) {
          return this.parseTypeSystemDefinition();
        }

        throw this.unexpected();
      } // Implements the parsing rules in the Operations section.

      /**
       * OperationDefinition :
       *  - SelectionSet
       *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
       */
      ;

      _proto.parseOperationDefinition = function parseOperationDefinition() {
        var start = this._lexer.token;

        if (this.peek(TokenKind.BRACE_L)) {
          return {
            kind: Kind.OPERATION_DEFINITION,
            operation: 'query',
            name: undefined,
            variableDefinitions: [],
            directives: [],
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start)
          };
        }

        var operation = this.parseOperationType();
        var name;

        if (this.peek(TokenKind.NAME)) {
          name = this.parseName();
        }

        return {
          kind: Kind.OPERATION_DEFINITION,
          operation: operation,
          name: name,
          variableDefinitions: this.parseVariableDefinitions(),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * OperationType : one of query mutation subscription
       */
      ;

      _proto.parseOperationType = function parseOperationType() {
        var operationToken = this.expectToken(TokenKind.NAME);

        switch (operationToken.value) {
          case 'query':
            return 'query';

          case 'mutation':
            return 'mutation';

          case 'subscription':
            return 'subscription';
        }

        throw this.unexpected(operationToken);
      }
      /**
       * VariableDefinitions : ( VariableDefinition+ )
       */
      ;

      _proto.parseVariableDefinitions = function parseVariableDefinitions() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
      }
      /**
       * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
       */
      ;

      _proto.parseVariableDefinition = function parseVariableDefinition() {
        var start = this._lexer.token;
        return {
          kind: Kind.VARIABLE_DEFINITION,
          variable: this.parseVariable(),
          type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
          defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseValueLiteral(true) : undefined,
          directives: this.parseDirectives(true),
          loc: this.loc(start)
        };
      }
      /**
       * Variable : $ Name
       */
      ;

      _proto.parseVariable = function parseVariable() {
        var start = this._lexer.token;
        this.expectToken(TokenKind.DOLLAR);
        return {
          kind: Kind.VARIABLE,
          name: this.parseName(),
          loc: this.loc(start)
        };
      }
      /**
       * SelectionSet : { Selection+ }
       */
      ;

      _proto.parseSelectionSet = function parseSelectionSet() {
        var start = this._lexer.token;
        return {
          kind: Kind.SELECTION_SET,
          selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R),
          loc: this.loc(start)
        };
      }
      /**
       * Selection :
       *   - Field
       *   - FragmentSpread
       *   - InlineFragment
       */
      ;

      _proto.parseSelection = function parseSelection() {
        return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
      }
      /**
       * Field : Alias? Name Arguments? Directives? SelectionSet?
       *
       * Alias : Name :
       */
      ;

      _proto.parseField = function parseField() {
        var start = this._lexer.token;
        var nameOrAlias = this.parseName();
        var alias;
        var name;

        if (this.expectOptionalToken(TokenKind.COLON)) {
          alias = nameOrAlias;
          name = this.parseName();
        } else {
          name = nameOrAlias;
        }

        return {
          kind: Kind.FIELD,
          alias: alias,
          name: name,
          arguments: this.parseArguments(false),
          directives: this.parseDirectives(false),
          selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : undefined,
          loc: this.loc(start)
        };
      }
      /**
       * Arguments[Const] : ( Argument[?Const]+ )
       */
      ;

      _proto.parseArguments = function parseArguments(isConst) {
        var item = isConst ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
      }
      /**
       * Argument[Const] : Name : Value[?Const]
       */
      ;

      _proto.parseArgument = function parseArgument() {
        var start = this._lexer.token;
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
          kind: Kind.ARGUMENT,
          name: name,
          value: this.parseValueLiteral(false),
          loc: this.loc(start)
        };
      };

      _proto.parseConstArgument = function parseConstArgument() {
        var start = this._lexer.token;
        return {
          kind: Kind.ARGUMENT,
          name: this.parseName(),
          value: (this.expectToken(TokenKind.COLON), this.parseValueLiteral(true)),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Fragments section.

      /**
       * Corresponds to both FragmentSpread and InlineFragment in the spec.
       *
       * FragmentSpread : ... FragmentName Directives?
       *
       * InlineFragment : ... TypeCondition? Directives? SelectionSet
       */
      ;

      _proto.parseFragment = function parseFragment() {
        var start = this._lexer.token;
        this.expectToken(TokenKind.SPREAD);
        var hasTypeCondition = this.expectOptionalKeyword('on');

        if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
          return {
            kind: Kind.FRAGMENT_SPREAD,
            name: this.parseFragmentName(),
            directives: this.parseDirectives(false),
            loc: this.loc(start)
          };
        }

        return {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * FragmentDefinition :
       *   - fragment FragmentName on TypeCondition Directives? SelectionSet
       *
       * TypeCondition : NamedType
       */
      ;

      _proto.parseFragmentDefinition = function parseFragmentDefinition() {
        var _this$_options;

        var start = this._lexer.token;
        this.expectKeyword('fragment'); // Experimental support for defining variables within fragments changes
        // the grammar of FragmentDefinition:
        //   - fragment FragmentName VariableDefinitions? on TypeCondition Directives? SelectionSet

        if (((_this$_options = this._options) === null || _this$_options === void 0 ? void 0 : _this$_options.experimentalFragmentVariables) === true) {
          return {
            kind: Kind.FRAGMENT_DEFINITION,
            name: this.parseFragmentName(),
            variableDefinitions: this.parseVariableDefinitions(),
            typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start)
          };
        }

        return {
          kind: Kind.FRAGMENT_DEFINITION,
          name: this.parseFragmentName(),
          typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
          loc: this.loc(start)
        };
      }
      /**
       * FragmentName : Name but not `on`
       */
      ;

      _proto.parseFragmentName = function parseFragmentName() {
        if (this._lexer.token.value === 'on') {
          throw this.unexpected();
        }

        return this.parseName();
      } // Implements the parsing rules in the Values section.

      /**
       * Value[Const] :
       *   - [~Const] Variable
       *   - IntValue
       *   - FloatValue
       *   - StringValue
       *   - BooleanValue
       *   - NullValue
       *   - EnumValue
       *   - ListValue[?Const]
       *   - ObjectValue[?Const]
       *
       * BooleanValue : one of `true` `false`
       *
       * NullValue : `null`
       *
       * EnumValue : Name but not `true`, `false` or `null`
       */
      ;

      _proto.parseValueLiteral = function parseValueLiteral(isConst) {
        var token = this._lexer.token;

        switch (token.kind) {
          case TokenKind.BRACKET_L:
            return this.parseList(isConst);

          case TokenKind.BRACE_L:
            return this.parseObject(isConst);

          case TokenKind.INT:
            this._lexer.advance();

            return {
              kind: Kind.INT,
              value: token.value,
              loc: this.loc(token)
            };

          case TokenKind.FLOAT:
            this._lexer.advance();

            return {
              kind: Kind.FLOAT,
              value: token.value,
              loc: this.loc(token)
            };

          case TokenKind.STRING:
          case TokenKind.BLOCK_STRING:
            return this.parseStringLiteral();

          case TokenKind.NAME:
            this._lexer.advance();

            switch (token.value) {
              case 'true':
                return {
                  kind: Kind.BOOLEAN,
                  value: true,
                  loc: this.loc(token)
                };

              case 'false':
                return {
                  kind: Kind.BOOLEAN,
                  value: false,
                  loc: this.loc(token)
                };

              case 'null':
                return {
                  kind: Kind.NULL,
                  loc: this.loc(token)
                };

              default:
                return {
                  kind: Kind.ENUM,
                  value: token.value,
                  loc: this.loc(token)
                };
            }

          case TokenKind.DOLLAR:
            if (!isConst) {
              return this.parseVariable();
            }

            break;
        }

        throw this.unexpected();
      };

      _proto.parseStringLiteral = function parseStringLiteral() {
        var token = this._lexer.token;

        this._lexer.advance();

        return {
          kind: Kind.STRING,
          value: token.value,
          block: token.kind === TokenKind.BLOCK_STRING,
          loc: this.loc(token)
        };
      }
      /**
       * ListValue[Const] :
       *   - [ ]
       *   - [ Value[?Const]+ ]
       */
      ;

      _proto.parseList = function parseList(isConst) {
        var _this = this;

        var start = this._lexer.token;

        var item = function item() {
          return _this.parseValueLiteral(isConst);
        };

        return {
          kind: Kind.LIST,
          values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
          loc: this.loc(start)
        };
      }
      /**
       * ObjectValue[Const] :
       *   - { }
       *   - { ObjectField[?Const]+ }
       */
      ;

      _proto.parseObject = function parseObject(isConst) {
        var _this2 = this;

        var start = this._lexer.token;

        var item = function item() {
          return _this2.parseObjectField(isConst);
        };

        return {
          kind: Kind.OBJECT,
          fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
          loc: this.loc(start)
        };
      }
      /**
       * ObjectField[Const] : Name : Value[?Const]
       */
      ;

      _proto.parseObjectField = function parseObjectField(isConst) {
        var start = this._lexer.token;
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
          kind: Kind.OBJECT_FIELD,
          name: name,
          value: this.parseValueLiteral(isConst),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Directives section.

      /**
       * Directives[Const] : Directive[?Const]+
       */
      ;

      _proto.parseDirectives = function parseDirectives(isConst) {
        var directives = [];

        while (this.peek(TokenKind.AT)) {
          directives.push(this.parseDirective(isConst));
        }

        return directives;
      }
      /**
       * Directive[Const] : @ Name Arguments[?Const]?
       */
      ;

      _proto.parseDirective = function parseDirective(isConst) {
        var start = this._lexer.token;
        this.expectToken(TokenKind.AT);
        return {
          kind: Kind.DIRECTIVE,
          name: this.parseName(),
          arguments: this.parseArguments(isConst),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Types section.

      /**
       * Type :
       *   - NamedType
       *   - ListType
       *   - NonNullType
       */
      ;

      _proto.parseTypeReference = function parseTypeReference() {
        var start = this._lexer.token;
        var type;

        if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
          type = this.parseTypeReference();
          this.expectToken(TokenKind.BRACKET_R);
          type = {
            kind: Kind.LIST_TYPE,
            type: type,
            loc: this.loc(start)
          };
        } else {
          type = this.parseNamedType();
        }

        if (this.expectOptionalToken(TokenKind.BANG)) {
          return {
            kind: Kind.NON_NULL_TYPE,
            type: type,
            loc: this.loc(start)
          };
        }

        return type;
      }
      /**
       * NamedType : Name
       */
      ;

      _proto.parseNamedType = function parseNamedType() {
        var start = this._lexer.token;
        return {
          kind: Kind.NAMED_TYPE,
          name: this.parseName(),
          loc: this.loc(start)
        };
      } // Implements the parsing rules in the Type Definition section.

      /**
       * TypeSystemDefinition :
       *   - SchemaDefinition
       *   - TypeDefinition
       *   - DirectiveDefinition
       *
       * TypeDefinition :
       *   - ScalarTypeDefinition
       *   - ObjectTypeDefinition
       *   - InterfaceTypeDefinition
       *   - UnionTypeDefinition
       *   - EnumTypeDefinition
       *   - InputObjectTypeDefinition
       */
      ;

      _proto.parseTypeSystemDefinition = function parseTypeSystemDefinition() {
        // Many definitions begin with a description and require a lookahead.
        var keywordToken = this.peekDescription() ? this._lexer.lookahead() : this._lexer.token;

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaDefinition();

            case 'scalar':
              return this.parseScalarTypeDefinition();

            case 'type':
              return this.parseObjectTypeDefinition();

            case 'interface':
              return this.parseInterfaceTypeDefinition();

            case 'union':
              return this.parseUnionTypeDefinition();

            case 'enum':
              return this.parseEnumTypeDefinition();

            case 'input':
              return this.parseInputObjectTypeDefinition();

            case 'directive':
              return this.parseDirectiveDefinition();
          }
        }

        throw this.unexpected(keywordToken);
      };

      _proto.peekDescription = function peekDescription() {
        return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
      }
      /**
       * Description : StringValue
       */
      ;

      _proto.parseDescription = function parseDescription() {
        if (this.peekDescription()) {
          return this.parseStringLiteral();
        }
      }
      /**
       * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
       */
      ;

      _proto.parseSchemaDefinition = function parseSchemaDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('schema');
        var directives = this.parseDirectives(true);
        var operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        return {
          kind: Kind.SCHEMA_DEFINITION,
          description: description,
          directives: directives,
          operationTypes: operationTypes,
          loc: this.loc(start)
        };
      }
      /**
       * OperationTypeDefinition : OperationType : NamedType
       */
      ;

      _proto.parseOperationTypeDefinition = function parseOperationTypeDefinition() {
        var start = this._lexer.token;
        var operation = this.parseOperationType();
        this.expectToken(TokenKind.COLON);
        var type = this.parseNamedType();
        return {
          kind: Kind.OPERATION_TYPE_DEFINITION,
          operation: operation,
          type: type,
          loc: this.loc(start)
        };
      }
      /**
       * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
       */
      ;

      _proto.parseScalarTypeDefinition = function parseScalarTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('scalar');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.SCALAR_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ObjectTypeDefinition :
       *   Description?
       *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
       */
      ;

      _proto.parseObjectTypeDefinition = function parseObjectTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('type');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();
        return {
          kind: Kind.OBJECT_TYPE_DEFINITION,
          description: description,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * ImplementsInterfaces :
       *   - implements `&`? NamedType
       *   - ImplementsInterfaces & NamedType
       */
      ;

      _proto.parseImplementsInterfaces = function parseImplementsInterfaces() {
        var _this$_options2;

        if (!this.expectOptionalKeyword('implements')) {
          return [];
        }

        if (((_this$_options2 = this._options) === null || _this$_options2 === void 0 ? void 0 : _this$_options2.allowLegacySDLImplementsInterfaces) === true) {
          var types = []; // Optional leading ampersand

          this.expectOptionalToken(TokenKind.AMP);

          do {
            types.push(this.parseNamedType());
          } while (this.expectOptionalToken(TokenKind.AMP) || this.peek(TokenKind.NAME));

          return types;
        }

        return this.delimitedMany(TokenKind.AMP, this.parseNamedType);
      }
      /**
       * FieldsDefinition : { FieldDefinition+ }
       */
      ;

      _proto.parseFieldsDefinition = function parseFieldsDefinition() {
        var _this$_options3;

        // Legacy support for the SDL?
        if (((_this$_options3 = this._options) === null || _this$_options3 === void 0 ? void 0 : _this$_options3.allowLegacySDLEmptyFields) === true && this.peek(TokenKind.BRACE_L) && this._lexer.lookahead().kind === TokenKind.BRACE_R) {
          this._lexer.advance();

          this._lexer.advance();

          return [];
        }

        return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
      }
      /**
       * FieldDefinition :
       *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
       */
      ;

      _proto.parseFieldDefinition = function parseFieldDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        var args = this.parseArgumentDefs();
        this.expectToken(TokenKind.COLON);
        var type = this.parseTypeReference();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.FIELD_DEFINITION,
          description: description,
          name: name,
          arguments: args,
          type: type,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ArgumentsDefinition : ( InputValueDefinition+ )
       */
      ;

      _proto.parseArgumentDefs = function parseArgumentDefs() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
      }
      /**
       * InputValueDefinition :
       *   - Description? Name : Type DefaultValue? Directives[Const]?
       */
      ;

      _proto.parseInputValueDef = function parseInputValueDef() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        this.expectToken(TokenKind.COLON);
        var type = this.parseTypeReference();
        var defaultValue;

        if (this.expectOptionalToken(TokenKind.EQUALS)) {
          defaultValue = this.parseValueLiteral(true);
        }

        var directives = this.parseDirectives(true);
        return {
          kind: Kind.INPUT_VALUE_DEFINITION,
          description: description,
          name: name,
          type: type,
          defaultValue: defaultValue,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * InterfaceTypeDefinition :
       *   - Description? interface Name Directives[Const]? FieldsDefinition?
       */
      ;

      _proto.parseInterfaceTypeDefinition = function parseInterfaceTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('interface');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();
        return {
          kind: Kind.INTERFACE_TYPE_DEFINITION,
          description: description,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * UnionTypeDefinition :
       *   - Description? union Name Directives[Const]? UnionMemberTypes?
       */
      ;

      _proto.parseUnionTypeDefinition = function parseUnionTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('union');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var types = this.parseUnionMemberTypes();
        return {
          kind: Kind.UNION_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          types: types,
          loc: this.loc(start)
        };
      }
      /**
       * UnionMemberTypes :
       *   - = `|`? NamedType
       *   - UnionMemberTypes | NamedType
       */
      ;

      _proto.parseUnionMemberTypes = function parseUnionMemberTypes() {
        return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
      }
      /**
       * EnumTypeDefinition :
       *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
       */
      ;

      _proto.parseEnumTypeDefinition = function parseEnumTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('enum');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var values = this.parseEnumValuesDefinition();
        return {
          kind: Kind.ENUM_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          values: values,
          loc: this.loc(start)
        };
      }
      /**
       * EnumValuesDefinition : { EnumValueDefinition+ }
       */
      ;

      _proto.parseEnumValuesDefinition = function parseEnumValuesDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
      }
      /**
       * EnumValueDefinition : Description? EnumValue Directives[Const]?
       *
       * EnumValue : Name
       */
      ;

      _proto.parseEnumValueDefinition = function parseEnumValueDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        return {
          kind: Kind.ENUM_VALUE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * InputObjectTypeDefinition :
       *   - Description? input Name Directives[Const]? InputFieldsDefinition?
       */
      ;

      _proto.parseInputObjectTypeDefinition = function parseInputObjectTypeDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('input');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var fields = this.parseInputFieldsDefinition();
        return {
          kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
          description: description,
          name: name,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * InputFieldsDefinition : { InputValueDefinition+ }
       */
      ;

      _proto.parseInputFieldsDefinition = function parseInputFieldsDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
      }
      /**
       * TypeSystemExtension :
       *   - SchemaExtension
       *   - TypeExtension
       *
       * TypeExtension :
       *   - ScalarTypeExtension
       *   - ObjectTypeExtension
       *   - InterfaceTypeExtension
       *   - UnionTypeExtension
       *   - EnumTypeExtension
       *   - InputObjectTypeDefinition
       */
      ;

      _proto.parseTypeSystemExtension = function parseTypeSystemExtension() {
        var keywordToken = this._lexer.lookahead();

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaExtension();

            case 'scalar':
              return this.parseScalarTypeExtension();

            case 'type':
              return this.parseObjectTypeExtension();

            case 'interface':
              return this.parseInterfaceTypeExtension();

            case 'union':
              return this.parseUnionTypeExtension();

            case 'enum':
              return this.parseEnumTypeExtension();

            case 'input':
              return this.parseInputObjectTypeExtension();
          }
        }

        throw this.unexpected(keywordToken);
      }
      /**
       * SchemaExtension :
       *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
       *  - extend schema Directives[Const]
       */
      ;

      _proto.parseSchemaExtension = function parseSchemaExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('schema');
        var directives = this.parseDirectives(true);
        var operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);

        if (directives.length === 0 && operationTypes.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.SCHEMA_EXTENSION,
          directives: directives,
          operationTypes: operationTypes,
          loc: this.loc(start)
        };
      }
      /**
       * ScalarTypeExtension :
       *   - extend scalar Name Directives[Const]
       */
      ;

      _proto.parseScalarTypeExtension = function parseScalarTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('scalar');
        var name = this.parseName();
        var directives = this.parseDirectives(true);

        if (directives.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.SCALAR_TYPE_EXTENSION,
          name: name,
          directives: directives,
          loc: this.loc(start)
        };
      }
      /**
       * ObjectTypeExtension :
       *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend type Name ImplementsInterfaces? Directives[Const]
       *  - extend type Name ImplementsInterfaces
       */
      ;

      _proto.parseObjectTypeExtension = function parseObjectTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('type');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();

        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.OBJECT_TYPE_EXTENSION,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * InterfaceTypeExtension :
       *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend interface Name ImplementsInterfaces? Directives[Const]
       *  - extend interface Name ImplementsInterfaces
       */
      ;

      _proto.parseInterfaceTypeExtension = function parseInterfaceTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('interface');
        var name = this.parseName();
        var interfaces = this.parseImplementsInterfaces();
        var directives = this.parseDirectives(true);
        var fields = this.parseFieldsDefinition();

        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.INTERFACE_TYPE_EXTENSION,
          name: name,
          interfaces: interfaces,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * UnionTypeExtension :
       *   - extend union Name Directives[Const]? UnionMemberTypes
       *   - extend union Name Directives[Const]
       */
      ;

      _proto.parseUnionTypeExtension = function parseUnionTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('union');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var types = this.parseUnionMemberTypes();

        if (directives.length === 0 && types.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.UNION_TYPE_EXTENSION,
          name: name,
          directives: directives,
          types: types,
          loc: this.loc(start)
        };
      }
      /**
       * EnumTypeExtension :
       *   - extend enum Name Directives[Const]? EnumValuesDefinition
       *   - extend enum Name Directives[Const]
       */
      ;

      _proto.parseEnumTypeExtension = function parseEnumTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('enum');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var values = this.parseEnumValuesDefinition();

        if (directives.length === 0 && values.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.ENUM_TYPE_EXTENSION,
          name: name,
          directives: directives,
          values: values,
          loc: this.loc(start)
        };
      }
      /**
       * InputObjectTypeExtension :
       *   - extend input Name Directives[Const]? InputFieldsDefinition
       *   - extend input Name Directives[Const]
       */
      ;

      _proto.parseInputObjectTypeExtension = function parseInputObjectTypeExtension() {
        var start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('input');
        var name = this.parseName();
        var directives = this.parseDirectives(true);
        var fields = this.parseInputFieldsDefinition();

        if (directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return {
          kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
          name: name,
          directives: directives,
          fields: fields,
          loc: this.loc(start)
        };
      }
      /**
       * DirectiveDefinition :
       *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
       */
      ;

      _proto.parseDirectiveDefinition = function parseDirectiveDefinition() {
        var start = this._lexer.token;
        var description = this.parseDescription();
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        var name = this.parseName();
        var args = this.parseArgumentDefs();
        var repeatable = this.expectOptionalKeyword('repeatable');
        this.expectKeyword('on');
        var locations = this.parseDirectiveLocations();
        return {
          kind: Kind.DIRECTIVE_DEFINITION,
          description: description,
          name: name,
          arguments: args,
          repeatable: repeatable,
          locations: locations,
          loc: this.loc(start)
        };
      }
      /**
       * DirectiveLocations :
       *   - `|`? DirectiveLocation
       *   - DirectiveLocations | DirectiveLocation
       */
      ;

      _proto.parseDirectiveLocations = function parseDirectiveLocations() {
        return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
      }
      /*
       * DirectiveLocation :
       *   - ExecutableDirectiveLocation
       *   - TypeSystemDirectiveLocation
       *
       * ExecutableDirectiveLocation : one of
       *   `QUERY`
       *   `MUTATION`
       *   `SUBSCRIPTION`
       *   `FIELD`
       *   `FRAGMENT_DEFINITION`
       *   `FRAGMENT_SPREAD`
       *   `INLINE_FRAGMENT`
       *
       * TypeSystemDirectiveLocation : one of
       *   `SCHEMA`
       *   `SCALAR`
       *   `OBJECT`
       *   `FIELD_DEFINITION`
       *   `ARGUMENT_DEFINITION`
       *   `INTERFACE`
       *   `UNION`
       *   `ENUM`
       *   `ENUM_VALUE`
       *   `INPUT_OBJECT`
       *   `INPUT_FIELD_DEFINITION`
       */
      ;

      _proto.parseDirectiveLocation = function parseDirectiveLocation() {
        var start = this._lexer.token;
        var name = this.parseName();

        if (DirectiveLocation[name.value] !== undefined) {
          return name;
        }

        throw this.unexpected(start);
      } // Core parsing utility functions

      /**
       * Returns a location object, used to identify the place in the source that created a given parsed object.
       */
      ;

      _proto.loc = function loc(startToken) {
        var _this$_options4;

        if (((_this$_options4 = this._options) === null || _this$_options4 === void 0 ? void 0 : _this$_options4.noLocation) !== true) {
          return new Location(startToken, this._lexer.lastToken, this._lexer.source);
        }
      }
      /**
       * Determines if the next token is of a given kind
       */
      ;

      _proto.peek = function peek(kind) {
        return this._lexer.token.kind === kind;
      }
      /**
       * If the next token is of the given kind, return that token after advancing the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */
      ;

      _proto.expectToken = function expectToken(kind) {
        var token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        throw syntaxError(this._lexer.source, token.start, "Expected ".concat(getTokenKindDesc(kind), ", found ").concat(getTokenDesc(token), "."));
      }
      /**
       * If the next token is of the given kind, return that token after advancing the lexer.
       * Otherwise, do not change the parser state and return undefined.
       */
      ;

      _proto.expectOptionalToken = function expectOptionalToken(kind) {
        var token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        return undefined;
      }
      /**
       * If the next token is a given keyword, advance the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */
      ;

      _proto.expectKeyword = function expectKeyword(value) {
        var token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();
        } else {
          throw syntaxError(this._lexer.source, token.start, "Expected \"".concat(value, "\", found ").concat(getTokenDesc(token), "."));
        }
      }
      /**
       * If the next token is a given keyword, return "true" after advancing the lexer.
       * Otherwise, do not change the parser state and return "false".
       */
      ;

      _proto.expectOptionalKeyword = function expectOptionalKeyword(value) {
        var token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();

          return true;
        }

        return false;
      }
      /**
       * Helper function for creating an error when an unexpected lexed token is encountered.
       */
      ;

      _proto.unexpected = function unexpected(atToken) {
        var token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
        return syntaxError(this._lexer.source, token.start, "Unexpected ".concat(getTokenDesc(token), "."));
      }
      /**
       * Returns a possibly empty list of parse nodes, determined by the parseFn.
       * This list begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */
      ;

      _proto.any = function any(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        var nodes = [];

        while (!this.expectOptionalToken(closeKind)) {
          nodes.push(parseFn.call(this));
        }

        return nodes;
      }
      /**
       * Returns a list of parse nodes, determined by the parseFn.
       * It can be empty only if open token is missing otherwise it will always return non-empty list
       * that begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */
      ;

      _proto.optionalMany = function optionalMany(openKind, parseFn, closeKind) {
        if (this.expectOptionalToken(openKind)) {
          var nodes = [];

          do {
            nodes.push(parseFn.call(this));
          } while (!this.expectOptionalToken(closeKind));

          return nodes;
        }

        return [];
      }
      /**
       * Returns a non-empty list of parse nodes, determined by the parseFn.
       * This list begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */
      ;

      _proto.many = function many(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        var nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));

        return nodes;
      }
      /**
       * Returns a non-empty list of parse nodes, determined by the parseFn.
       * This list may begin with a lex token of delimiterKind followed by items separated by lex tokens of tokenKind.
       * Advances the parser to the next lex token after last item in the list.
       */
      ;

      _proto.delimitedMany = function delimitedMany(delimiterKind, parseFn) {
        this.expectOptionalToken(delimiterKind);
        var nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (this.expectOptionalToken(delimiterKind));

        return nodes;
      };

      return Parser;
    }();
    /**
     * A helper function to describe a token as a string for debugging.
     */

    function getTokenDesc(token) {
      var value = token.value;
      return getTokenKindDesc(token.kind) + (value != null ? " \"".concat(value, "\"") : '');
    }
    /**
     * A helper function to describe a token kind as a string for debugging.
     */


    function getTokenKindDesc(kind) {
      return isPunctuatorTokenKind(kind) ? "\"".concat(kind, "\"") : kind;
    }

    var docCache = new Map();
    var fragmentSourceMap = new Map();
    var printFragmentWarnings = true;
    var experimentalFragmentVariables = false;
    function normalize(string) {
        return string.replace(/[\s,]+/g, ' ').trim();
    }
    function cacheKeyFromLoc(loc) {
        return normalize(loc.source.body.substring(loc.start, loc.end));
    }
    function processFragments(ast) {
        var seenKeys = new Set();
        var definitions = [];
        ast.definitions.forEach(function (fragmentDefinition) {
            if (fragmentDefinition.kind === 'FragmentDefinition') {
                var fragmentName = fragmentDefinition.name.value;
                var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);
                var sourceKeySet = fragmentSourceMap.get(fragmentName);
                if (sourceKeySet && !sourceKeySet.has(sourceKey)) {
                    if (printFragmentWarnings) {
                        console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
                            + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
                            + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
                    }
                }
                else if (!sourceKeySet) {
                    fragmentSourceMap.set(fragmentName, sourceKeySet = new Set);
                }
                sourceKeySet.add(sourceKey);
                if (!seenKeys.has(sourceKey)) {
                    seenKeys.add(sourceKey);
                    definitions.push(fragmentDefinition);
                }
            }
            else {
                definitions.push(fragmentDefinition);
            }
        });
        return __assign$1(__assign$1({}, ast), { definitions: definitions });
    }
    function stripLoc(doc) {
        var workSet = new Set(doc.definitions);
        workSet.forEach(function (node) {
            if (node.loc)
                delete node.loc;
            Object.keys(node).forEach(function (key) {
                var value = node[key];
                if (value && typeof value === 'object') {
                    workSet.add(value);
                }
            });
        });
        var loc = doc.loc;
        if (loc) {
            delete loc.startToken;
            delete loc.endToken;
        }
        return doc;
    }
    function parseDocument(source) {
        var cacheKey = normalize(source);
        if (!docCache.has(cacheKey)) {
            var parsed = parse(source, {
                experimentalFragmentVariables: experimentalFragmentVariables
            });
            if (!parsed || parsed.kind !== 'Document') {
                throw new Error('Not a valid GraphQL document.');
            }
            docCache.set(cacheKey, stripLoc(processFragments(parsed)));
        }
        return docCache.get(cacheKey);
    }
    function gql(literals) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (typeof literals === 'string') {
            literals = [literals];
        }
        var result = literals[0];
        args.forEach(function (arg, i) {
            if (arg && arg.kind === 'Document') {
                result += arg.loc.source.body;
            }
            else {
                result += arg;
            }
            result += literals[i + 1];
        });
        return parseDocument(result);
    }
    function resetCaches() {
        docCache.clear();
        fragmentSourceMap.clear();
    }
    function disableFragmentWarnings() {
        printFragmentWarnings = false;
    }
    function enableExperimentalFragmentVariables() {
        experimentalFragmentVariables = true;
    }
    function disableExperimentalFragmentVariables() {
        experimentalFragmentVariables = false;
    }
    var extras = {
        gql: gql,
        resetCaches: resetCaches,
        disableFragmentWarnings: disableFragmentWarnings,
        enableExperimentalFragmentVariables: enableExperimentalFragmentVariables,
        disableExperimentalFragmentVariables: disableExperimentalFragmentVariables
    };
    (function (gql_1) {
        gql_1.gql = extras.gql, gql_1.resetCaches = extras.resetCaches, gql_1.disableFragmentWarnings = extras.disableFragmentWarnings, gql_1.enableExperimentalFragmentVariables = extras.enableExperimentalFragmentVariables, gql_1.disableExperimentalFragmentVariables = extras.disableExperimentalFragmentVariables;
    })(gql || (gql = {}));
    gql["default"] = gql;
    var gql$1 = gql;

    var genericMessage$1 = "Invariant Violation";
    var _a$3 = Object.setPrototypeOf, setPrototypeOf$1 = _a$3 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$3;
    var InvariantError$1 = /** @class */ (function (_super) {
        __extends$1(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage$1; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage$1 + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage$1;
            setPrototypeOf$1(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$1(condition, message) {
        if (!condition) {
            throw new InvariantError$1(message);
        }
    }
    function wrapConsoleMethod$1(method) {
        return function () {
            return console[method].apply(console, arguments);
        };
    }
    (function (invariant) {
        invariant.warn = wrapConsoleMethod$1("warn");
        invariant.error = wrapConsoleMethod$1("error");
    })(invariant$1 || (invariant$1 = {}));
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also attempt to define the stub globally when it is not already defined.
    var processStub = { env: {} };
    if (typeof process === "object") {
        processStub = process;
    }
    else
        try {
            // Using Function to evaluate this assignment in global scope also escapes
            // the strict mode of the current module, thereby allowing the assignment.
            // Inspired by https://github.com/facebook/regenerator/pull/369.
            Function("stub", "process = stub")(processStub);
        }
        catch (atLeastWeTried) {
            // The assignment can fail if a Content Security Policy heavy-handedly
            // forbids Function usage. In those environments, developers should take
            // extra care to replace process.env.NODE_ENV in their production builds,
            // or define an appropriate global.process polyfill.
        }

    var PRESET_CONFIG_KEYS = [
        'request',
        'uri',
        'credentials',
        'headers',
        'fetch',
        'fetchOptions',
        'clientState',
        'onError',
        'cacheRedirects',
        'cache',
        'name',
        'version',
        'resolvers',
        'typeDefs',
        'fragmentMatcher',
    ];
    var DefaultClient = (function (_super) {
        __extends$1(DefaultClient, _super);
        function DefaultClient(config) {
            if (config === void 0) { config = {}; }
            var _this = this;
            if (config) {
                var diff = Object.keys(config).filter(function (key) { return PRESET_CONFIG_KEYS.indexOf(key) === -1; });
                if (diff.length > 0) {
                    process.env.NODE_ENV === "production" || invariant$1.warn('ApolloBoost was initialized with unsupported options: ' +
                        ("" + diff.join(' ')));
                }
            }
            var request = config.request, uri = config.uri, credentials = config.credentials, headers = config.headers, fetch = config.fetch, fetchOptions = config.fetchOptions, clientState = config.clientState, cacheRedirects = config.cacheRedirects, errorCallback = config.onError, name = config.name, version = config.version, resolvers = config.resolvers, typeDefs = config.typeDefs, fragmentMatcher = config.fragmentMatcher;
            var cache = config.cache;
            process.env.NODE_ENV === "production" ? invariant$1(!cache || !cacheRedirects, 1) : invariant$1(!cache || !cacheRedirects, 'Incompatible cache configuration. When not providing `cache`, ' +
                'configure the provided instance with `cacheRedirects` instead.');
            if (!cache) {
                cache = cacheRedirects
                    ? new InMemoryCache({ cacheRedirects: cacheRedirects })
                    : new InMemoryCache();
            }
            var errorLink = errorCallback
                ? onError(errorCallback)
                : onError(function (_a) {
                    var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError;
                    if (graphQLErrors) {
                        graphQLErrors.forEach(function (_a) {
                            var message = _a.message, locations = _a.locations, path = _a.path;
                            return process.env.NODE_ENV === "production" || invariant$1.warn("[GraphQL error]: Message: " + message + ", Location: " +
                                (locations + ", Path: " + path));
                        });
                    }
                    if (networkError) {
                        process.env.NODE_ENV === "production" || invariant$1.warn("[Network error]: " + networkError);
                    }
                });
            var requestHandler = request
                ? new ApolloLink$1(function (operation, forward) {
                    return new Observable$1(function (observer) {
                        var handle;
                        Promise.resolve(operation)
                            .then(function (oper) { return request(oper); })
                            .then(function () {
                            handle = forward(operation).subscribe({
                                next: observer.next.bind(observer),
                                error: observer.error.bind(observer),
                                complete: observer.complete.bind(observer),
                            });
                        })
                            .catch(observer.error.bind(observer));
                        return function () {
                            if (handle) {
                                handle.unsubscribe();
                            }
                        };
                    });
                })
                : false;
            var httpLink = new HttpLink({
                uri: uri || '/graphql',
                fetch: fetch,
                fetchOptions: fetchOptions || {},
                credentials: credentials || 'same-origin',
                headers: headers || {},
            });
            var link = ApolloLink$1.from([errorLink, requestHandler, httpLink].filter(function (x) { return !!x; }));
            var activeResolvers = resolvers;
            var activeTypeDefs = typeDefs;
            var activeFragmentMatcher = fragmentMatcher;
            if (clientState) {
                if (clientState.defaults) {
                    cache.writeData({
                        data: clientState.defaults,
                    });
                }
                activeResolvers = clientState.resolvers;
                activeTypeDefs = clientState.typeDefs;
                activeFragmentMatcher = clientState.fragmentMatcher;
            }
            _this = _super.call(this, {
                cache: cache,
                link: link,
                name: name,
                version: version,
                resolvers: activeResolvers,
                typeDefs: activeTypeDefs,
                fragmentMatcher: activeFragmentMatcher,
            }) || this;
            return _this;
        }
        return DefaultClient;
    }(ApolloClient));

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var genericMessage = "Invariant Violation";
    var _a$2 = Object.setPrototypeOf, setPrototypeOf = _a$2 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$2;
    var InvariantError = /** @class */ (function (_super) {
        __extends(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage;
            setPrototypeOf(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant(condition, message) {
        if (!condition) {
            throw new InvariantError(message);
        }
    }
    var verbosityLevels = ["log", "warn", "error", "silent"];
    var verbosityLevel = verbosityLevels.indexOf("log");
    function wrapConsoleMethod(method) {
        return function () {
            if (verbosityLevels.indexOf(method) >= verbosityLevel) {
                return console[method].apply(console, arguments);
            }
        };
    }
    (function (invariant) {
        invariant.log = wrapConsoleMethod("log");
        invariant.warn = wrapConsoleMethod("warn");
        invariant.error = wrapConsoleMethod("error");
    })(invariant || (invariant = {}));
    function setVerbosity(level) {
        var old = verbosityLevels[verbosityLevel];
        verbosityLevel = Math.max(0, verbosityLevels.indexOf(level));
        return old;
    }
    // Code that uses ts-invariant with rollup-plugin-invariant may want to
    // import this process stub to avoid errors evaluating process.env.NODE_ENV.
    // However, because most ESM-to-CJS compilers will rewrite the process import
    // as tsInvariant.process, which prevents proper replacement by minifiers, we
    // also export processStub, so you can import { invariant, processStub } from
    // "ts-invariant" and assign processStub to a local variable named process.
    (typeof process === "object" &&
        typeof process.env === "object") ? process : { env: {} };

    function shouldInclude(_a, variables) {
        var directives = _a.directives;
        if (!directives || !directives.length) {
            return true;
        }
        return getInclusionDirectives(directives).every(function (_a) {
            var directive = _a.directive, ifArgument = _a.ifArgument;
            var evaledValue = false;
            if (ifArgument.value.kind === 'Variable') {
                evaledValue = variables && variables[ifArgument.value.name.value];
                process.env.NODE_ENV === "production" ? invariant(evaledValue !== void 0, 38) : invariant(evaledValue !== void 0, "Invalid variable referenced in @" + directive.name.value + " directive.");
            }
            else {
                evaledValue = ifArgument.value.value;
            }
            return directive.name.value === 'skip' ? !evaledValue : evaledValue;
        });
    }
    function getDirectiveNames(root) {
        var names = [];
        visit(root, {
            Directive: function (node) {
                names.push(node.name.value);
            },
        });
        return names;
    }
    function hasDirectives(names, root) {
        return getDirectiveNames(root).some(function (name) { return names.indexOf(name) > -1; });
    }
    function isInclusionDirective(_a) {
        var value = _a.name.value;
        return value === 'skip' || value === 'include';
    }
    function getInclusionDirectives(directives) {
        var result = [];
        if (directives && directives.length) {
            directives.forEach(function (directive) {
                if (!isInclusionDirective(directive))
                    return;
                var directiveArguments = directive.arguments;
                var directiveName = directive.name.value;
                process.env.NODE_ENV === "production" ? invariant(directiveArguments && directiveArguments.length === 1, 39) : invariant(directiveArguments && directiveArguments.length === 1, "Incorrect number of arguments for the @" + directiveName + " directive.");
                var ifArgument = directiveArguments[0];
                process.env.NODE_ENV === "production" ? invariant(ifArgument.name && ifArgument.name.value === 'if', 40) : invariant(ifArgument.name && ifArgument.name.value === 'if', "Invalid argument for the @" + directiveName + " directive.");
                var ifValue = ifArgument.value;
                process.env.NODE_ENV === "production" ? invariant(ifValue &&
                    (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 41) : invariant(ifValue &&
                    (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), "Argument for the @" + directiveName + " directive must be a variable or a boolean value.");
                result.push({ directive: directive, ifArgument: ifArgument });
            });
        }
        return result;
    }

    function getFragmentQueryDocument(document, fragmentName) {
        var actualFragmentName = fragmentName;
        var fragments = [];
        document.definitions.forEach(function (definition) {
            if (definition.kind === 'OperationDefinition') {
                throw process.env.NODE_ENV === "production" ? new InvariantError(42) : new InvariantError("Found a " + definition.operation + " operation" + (definition.name ? " named '" + definition.name.value + "'" : '') + ". " +
                    'No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            }
            if (definition.kind === 'FragmentDefinition') {
                fragments.push(definition);
            }
        });
        if (typeof actualFragmentName === 'undefined') {
            process.env.NODE_ENV === "production" ? invariant(fragments.length === 1, 43) : invariant(fragments.length === 1, "Found " + fragments.length + " fragments. `fragmentName` must be provided when there is not exactly 1 fragment.");
            actualFragmentName = fragments[0].name.value;
        }
        var query = __assign$2(__assign$2({}, document), { definitions: __spreadArrays([
                {
                    kind: 'OperationDefinition',
                    operation: 'query',
                    selectionSet: {
                        kind: 'SelectionSet',
                        selections: [
                            {
                                kind: 'FragmentSpread',
                                name: {
                                    kind: 'Name',
                                    value: actualFragmentName,
                                },
                            },
                        ],
                    },
                }
            ], document.definitions) });
        return query;
    }
    function createFragmentMap(fragments) {
        if (fragments === void 0) { fragments = []; }
        var symTable = {};
        fragments.forEach(function (fragment) {
            symTable[fragment.name.value] = fragment;
        });
        return symTable;
    }
    function getFragmentFromSelection(selection, fragmentMap) {
        switch (selection.kind) {
            case 'InlineFragment':
                return selection;
            case 'FragmentSpread': {
                var fragment = fragmentMap && fragmentMap[selection.name.value];
                process.env.NODE_ENV === "production" ? invariant(fragment, 44) : invariant(fragment, "No fragment named " + selection.name.value + ".");
                return fragment;
            }
            default:
                return null;
        }
    }

    function makeReference(id) {
        return { __ref: String(id) };
    }
    function isReference(obj) {
        return Boolean(obj && typeof obj === 'object' && typeof obj.__ref === 'string');
    }
    function isStringValue(value) {
        return value.kind === 'StringValue';
    }
    function isBooleanValue(value) {
        return value.kind === 'BooleanValue';
    }
    function isIntValue(value) {
        return value.kind === 'IntValue';
    }
    function isFloatValue(value) {
        return value.kind === 'FloatValue';
    }
    function isVariable(value) {
        return value.kind === 'Variable';
    }
    function isObjectValue(value) {
        return value.kind === 'ObjectValue';
    }
    function isListValue(value) {
        return value.kind === 'ListValue';
    }
    function isEnumValue(value) {
        return value.kind === 'EnumValue';
    }
    function isNullValue(value) {
        return value.kind === 'NullValue';
    }
    function valueToObjectRepresentation(argObj, name, value, variables) {
        if (isIntValue(value) || isFloatValue(value)) {
            argObj[name.value] = Number(value.value);
        }
        else if (isBooleanValue(value) || isStringValue(value)) {
            argObj[name.value] = value.value;
        }
        else if (isObjectValue(value)) {
            var nestedArgObj_1 = {};
            value.fields.map(function (obj) {
                return valueToObjectRepresentation(nestedArgObj_1, obj.name, obj.value, variables);
            });
            argObj[name.value] = nestedArgObj_1;
        }
        else if (isVariable(value)) {
            var variableValue = (variables || {})[value.name.value];
            argObj[name.value] = variableValue;
        }
        else if (isListValue(value)) {
            argObj[name.value] = value.values.map(function (listValue) {
                var nestedArgArrayObj = {};
                valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
                return nestedArgArrayObj[name.value];
            });
        }
        else if (isEnumValue(value)) {
            argObj[name.value] = value.value;
        }
        else if (isNullValue(value)) {
            argObj[name.value] = null;
        }
        else {
            throw process.env.NODE_ENV === "production" ? new InvariantError(53) : new InvariantError("The inline argument \"" + name.value + "\" of kind \"" + value.kind + "\"" +
                'is not supported. Use variables instead of inline arguments to ' +
                'overcome this limitation.');
        }
    }
    function storeKeyNameFromField(field, variables) {
        var directivesObj = null;
        if (field.directives) {
            directivesObj = {};
            field.directives.forEach(function (directive) {
                directivesObj[directive.name.value] = {};
                if (directive.arguments) {
                    directive.arguments.forEach(function (_a) {
                        var name = _a.name, value = _a.value;
                        return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
                    });
                }
            });
        }
        var argObj = null;
        if (field.arguments && field.arguments.length) {
            argObj = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation(argObj, name, value, variables);
            });
        }
        return getStoreKeyName(field.name.value, argObj, directivesObj);
    }
    var KNOWN_DIRECTIVES = [
        'connection',
        'include',
        'skip',
        'client',
        'rest',
        'export',
    ];
    function getStoreKeyName(fieldName, args, directives) {
        if (args &&
            directives &&
            directives['connection'] &&
            directives['connection']['key']) {
            if (directives['connection']['filter'] &&
                directives['connection']['filter'].length > 0) {
                var filterKeys = directives['connection']['filter']
                    ? directives['connection']['filter']
                    : [];
                filterKeys.sort();
                var filteredArgs_1 = {};
                filterKeys.forEach(function (key) {
                    filteredArgs_1[key] = args[key];
                });
                return directives['connection']['key'] + "(" + JSON.stringify(filteredArgs_1) + ")";
            }
            else {
                return directives['connection']['key'];
            }
        }
        var completeFieldName = fieldName;
        if (args) {
            var stringifiedArgs = fastJsonStableStringify(args);
            completeFieldName += "(" + stringifiedArgs + ")";
        }
        if (directives) {
            Object.keys(directives).forEach(function (key) {
                if (KNOWN_DIRECTIVES.indexOf(key) !== -1)
                    return;
                if (directives[key] && Object.keys(directives[key]).length) {
                    completeFieldName += "@" + key + "(" + JSON.stringify(directives[key]) + ")";
                }
                else {
                    completeFieldName += "@" + key;
                }
            });
        }
        return completeFieldName;
    }
    function argumentsObjectFromField(field, variables) {
        if (field.arguments && field.arguments.length) {
            var argObj_1 = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation(argObj_1, name, value, variables);
            });
            return argObj_1;
        }
        return null;
    }
    function resultKeyNameFromField(field) {
        return field.alias ? field.alias.value : field.name.value;
    }
    function getTypenameFromResult(result, selectionSet, fragmentMap) {
        if (typeof result.__typename === 'string') {
            return result.__typename;
        }
        for (var _i = 0, _a = selectionSet.selections; _i < _a.length; _i++) {
            var selection = _a[_i];
            if (isField(selection)) {
                if (selection.name.value === '__typename') {
                    return result[resultKeyNameFromField(selection)];
                }
            }
            else {
                var typename = getTypenameFromResult(result, getFragmentFromSelection(selection, fragmentMap).selectionSet, fragmentMap);
                if (typeof typename === 'string') {
                    return typename;
                }
            }
        }
    }
    function isField(selection) {
        return selection.kind === 'Field';
    }

    function checkDocument(doc) {
        process.env.NODE_ENV === "production" ? invariant(doc && doc.kind === 'Document', 45) : invariant(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
        var operations = doc.definitions
            .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
            .map(function (definition) {
            if (definition.kind !== 'OperationDefinition') {
                throw process.env.NODE_ENV === "production" ? new InvariantError(46) : new InvariantError("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
            }
            return definition;
        });
        process.env.NODE_ENV === "production" ? invariant(operations.length <= 1, 47) : invariant(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
        return doc;
    }
    function getOperationDefinition(doc) {
        checkDocument(doc);
        return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
    }
    function getOperationName(doc) {
        return (doc.definitions
            .filter(function (definition) {
            return definition.kind === 'OperationDefinition' && definition.name;
        })
            .map(function (x) { return x.name.value; })[0] || null);
    }
    function getFragmentDefinitions(doc) {
        return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
    }
    function getQueryDefinition(doc) {
        var queryDef = getOperationDefinition(doc);
        process.env.NODE_ENV === "production" ? invariant(queryDef && queryDef.operation === 'query', 48) : invariant(queryDef && queryDef.operation === 'query', 'Must contain a query definition.');
        return queryDef;
    }
    function getMainDefinition(queryDoc) {
        checkDocument(queryDoc);
        var fragmentDefinition;
        for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
            var definition = _a[_i];
            if (definition.kind === 'OperationDefinition') {
                var operation = definition.operation;
                if (operation === 'query' ||
                    operation === 'mutation' ||
                    operation === 'subscription') {
                    return definition;
                }
            }
            if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
                fragmentDefinition = definition;
            }
        }
        if (fragmentDefinition) {
            return fragmentDefinition;
        }
        throw process.env.NODE_ENV === "production" ? new InvariantError(52) : new InvariantError('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
    }
    function getDefaultValues(definition) {
        var defaultValues = Object.create(null);
        var defs = definition && definition.variableDefinitions;
        if (defs && defs.length) {
            defs.forEach(function (def) {
                if (def.defaultValue) {
                    valueToObjectRepresentation(defaultValues, def.variable.name, def.defaultValue);
                }
            });
        }
        return defaultValues;
    }

    var TYPENAME_FIELD = {
        kind: 'Field',
        name: {
            kind: 'Name',
            value: '__typename',
        },
    };
    function addTypenameToDocument(doc) {
        return visit(checkDocument(doc), {
            SelectionSet: {
                enter: function (node, _key, parent) {
                    if (parent &&
                        parent.kind === 'OperationDefinition') {
                        return;
                    }
                    var selections = node.selections;
                    if (!selections) {
                        return;
                    }
                    var skip = selections.some(function (selection) {
                        return (isField(selection) &&
                            (selection.name.value === '__typename' ||
                                selection.name.value.lastIndexOf('__', 0) === 0));
                    });
                    if (skip) {
                        return;
                    }
                    var field = parent;
                    if (isField(field) &&
                        field.directives &&
                        field.directives.some(function (d) { return d.name.value === 'export'; })) {
                        return;
                    }
                    return __assign$2(__assign$2({}, node), { selections: __spreadArrays(selections, [TYPENAME_FIELD]) });
                },
            },
        });
    }
    addTypenameToDocument.added = function (field) {
        return field === TYPENAME_FIELD;
    };

    var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
    function mergeDeepArray(sources) {
        var target = sources[0] || {};
        var count = sources.length;
        if (count > 1) {
            var merger = new DeepMerger();
            for (var i = 1; i < count; ++i) {
                target = merger.merge(target, sources[i]);
            }
        }
        return target;
    }
    function isObject$1(obj) {
        return obj !== null && typeof obj === 'object';
    }
    var defaultReconciler = function (target, source, property) {
        return this.merge(target[property], source[property]);
    };
    var DeepMerger = (function () {
        function DeepMerger(reconciler) {
            if (reconciler === void 0) { reconciler = defaultReconciler; }
            this.reconciler = reconciler;
            this.isObject = isObject$1;
            this.pastCopies = new Set();
        }
        DeepMerger.prototype.merge = function (target, source) {
            var _this = this;
            var context = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                context[_i - 2] = arguments[_i];
            }
            if (isObject$1(source) && isObject$1(target)) {
                Object.keys(source).forEach(function (sourceKey) {
                    if (hasOwnProperty$2.call(target, sourceKey)) {
                        var targetValue = target[sourceKey];
                        if (source[sourceKey] !== targetValue) {
                            var result = _this.reconciler.apply(_this, __spreadArrays([target, source, sourceKey], context));
                            if (result !== targetValue) {
                                target = _this.shallowCopyForMerge(target);
                                target[sourceKey] = result;
                            }
                        }
                    }
                    else {
                        target = _this.shallowCopyForMerge(target);
                        target[sourceKey] = source[sourceKey];
                    }
                });
                return target;
            }
            return source;
        };
        DeepMerger.prototype.shallowCopyForMerge = function (value) {
            if (isObject$1(value) && !this.pastCopies.has(value)) {
                if (Array.isArray(value)) {
                    value = value.slice(0);
                }
                else {
                    value = __assign$2({ __proto__: Object.getPrototypeOf(value) }, value);
                }
                this.pastCopies.add(value);
            }
            return value;
        };
        return DeepMerger;
    }());

    function symbolObservablePonyfill(root) {
    	var result;
    	var Symbol = root.Symbol;

    	if (typeof Symbol === 'function') {
    		if (Symbol.observable) {
    			result = Symbol.observable;
    		} else {

    			// This just needs to be something that won't trample other user's Symbol.for use
    			// It also will guide people to the source of their issues, if this is problematic.
    			// META: It's a resource locator!
    			result = Symbol.for('https://github.com/benlesh/symbol-observable');
    			try {
    				Symbol.observable = result;
    			} catch (err) {
    				// Do nothing. In some environments, users have frozen `Symbol` for security reasons,
    				// if it is frozen assigning to it will throw. In this case, we don't care, because
    				// they will need to use the returned value from the ponyfill.
    			}
    		}
    	} else {
    		result = '@@observable';
    	}

    	return result;
    }

    /* global window */

    var root;

    if (typeof self !== 'undefined') {
      root = self;
    } else if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global;
    } else if (typeof module !== 'undefined') {
      root = module;
    } else {
      root = Function('return this')();
    }

    symbolObservablePonyfill(root);

    var prototype = zenObservable.prototype;
    var fakeObsSymbol = '@@observable';
    if (!prototype[fakeObsSymbol]) {
        prototype[fakeObsSymbol] = function () { return this; };
    }

    var toString$1 = Object.prototype.toString;
    function cloneDeep(value) {
        return cloneDeepHelper(value);
    }
    function cloneDeepHelper(val, seen) {
        switch (toString$1.call(val)) {
            case "[object Array]": {
                seen = seen || new Map;
                if (seen.has(val))
                    return seen.get(val);
                var copy_1 = val.slice(0);
                seen.set(val, copy_1);
                copy_1.forEach(function (child, i) {
                    copy_1[i] = cloneDeepHelper(child, seen);
                });
                return copy_1;
            }
            case "[object Object]": {
                seen = seen || new Map;
                if (seen.has(val))
                    return seen.get(val);
                var copy_2 = Object.create(Object.getPrototypeOf(val));
                seen.set(val, copy_2);
                Object.keys(val).forEach(function (key) {
                    copy_2[key] = cloneDeepHelper(val[key], seen);
                });
                return copy_2;
            }
            default:
                return val;
        }
    }

    function getEnv() {
        if (typeof process !== 'undefined' && process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        return 'development';
    }
    function isEnv(env) {
        return getEnv() === env;
    }
    function isDevelopment() {
        return isEnv('development') === true;
    }
    function isTest() {
        return isEnv('test') === true;
    }

    function isObject(value) {
        return value !== null && typeof value === "object";
    }
    function deepFreeze(value) {
        var workSet = new Set([value]);
        workSet.forEach(function (obj) {
            if (isObject(obj)) {
                if (!Object.isFrozen(obj))
                    Object.freeze(obj);
                Object.getOwnPropertyNames(obj).forEach(function (name) {
                    if (isObject(obj[name]))
                        workSet.add(obj[name]);
                });
            }
        });
        return value;
    }
    function maybeDeepFreeze(obj) {
        if (process.env.NODE_ENV !== "production" && (isDevelopment() || isTest())) {
            deepFreeze(obj);
        }
        return obj;
    }

    function iterateObserversSafely(observers, method, argument) {
        var observersWithMethod = [];
        observers.forEach(function (obs) { return obs[method] && observersWithMethod.push(obs); });
        observersWithMethod.forEach(function (obs) { return obs[method](argument); });
    }

    function fixObservableSubclass(subclass) {
        function set(key) {
            Object.defineProperty(subclass, key, { value: zenObservable });
        }
        if (typeof Symbol === "function" && Symbol.species) {
            set(Symbol.species);
        }
        set("@@species");
        return subclass;
    }

    function isPromiseLike(value) {
        return value && typeof value.then === "function";
    }
    var Concast = (function (_super) {
        __extends$1(Concast, _super);
        function Concast(sources) {
            var _this = _super.call(this, function (observer) {
                _this.addObserver(observer);
                return function () { return _this.removeObserver(observer); };
            }) || this;
            _this.observers = new Set();
            _this.addCount = 0;
            _this.promise = new Promise(function (resolve, reject) {
                _this.resolve = resolve;
                _this.reject = reject;
            });
            _this.handlers = {
                next: function (result) {
                    if (_this.sub !== null) {
                        _this.latest = ["next", result];
                        iterateObserversSafely(_this.observers, "next", result);
                    }
                },
                error: function (error) {
                    var sub = _this.sub;
                    if (sub !== null) {
                        if (sub)
                            Promise.resolve().then(function () { return sub.unsubscribe(); });
                        _this.sub = null;
                        _this.latest = ["error", error];
                        _this.reject(error);
                        iterateObserversSafely(_this.observers, "error", error);
                    }
                },
                complete: function () {
                    if (_this.sub !== null) {
                        var value = _this.sources.shift();
                        if (!value) {
                            _this.sub = null;
                            if (_this.latest &&
                                _this.latest[0] === "next") {
                                _this.resolve(_this.latest[1]);
                            }
                            else {
                                _this.resolve();
                            }
                            iterateObserversSafely(_this.observers, "complete");
                        }
                        else if (isPromiseLike(value)) {
                            value.then(function (obs) { return _this.sub = obs.subscribe(_this.handlers); });
                        }
                        else {
                            _this.sub = value.subscribe(_this.handlers);
                        }
                    }
                },
            };
            _this.cancel = function (reason) {
                _this.reject(reason);
                _this.sources = [];
                _this.handlers.complete();
            };
            _this.promise.catch(function (_) { });
            if (typeof sources === "function") {
                sources = [new zenObservable(sources)];
            }
            if (isPromiseLike(sources)) {
                sources.then(function (iterable) { return _this.start(iterable); }, _this.handlers.error);
            }
            else {
                _this.start(sources);
            }
            return _this;
        }
        Concast.prototype.start = function (sources) {
            if (this.sub !== void 0)
                return;
            this.sources = Array.from(sources);
            this.handlers.complete();
        };
        Concast.prototype.deliverLastMessage = function (observer) {
            if (this.latest) {
                var nextOrError = this.latest[0];
                var method = observer[nextOrError];
                if (method) {
                    method.call(observer, this.latest[1]);
                }
                if (this.sub === null &&
                    nextOrError === "next" &&
                    observer.complete) {
                    observer.complete();
                }
            }
        };
        Concast.prototype.addObserver = function (observer) {
            if (!this.observers.has(observer)) {
                this.deliverLastMessage(observer);
                this.observers.add(observer);
                ++this.addCount;
            }
        };
        Concast.prototype.removeObserver = function (observer, quietly) {
            if (this.observers.delete(observer) &&
                --this.addCount < 1 &&
                !quietly) {
                this.handlers.error(new Error("Observable cancelled prematurely"));
            }
        };
        Concast.prototype.cleanup = function (callback) {
            var _this = this;
            var called = false;
            var once = function () {
                if (!called) {
                    called = true;
                    _this.observers.delete(observer);
                    callback();
                }
            };
            var observer = {
                next: once,
                error: once,
                complete: once,
            };
            var count = this.addCount;
            this.addObserver(observer);
            this.addCount = count;
        };
        return Concast;
    }(zenObservable));
    fixObservableSubclass(Concast);

    function isNonEmptyArray(value) {
        return Array.isArray(value) && value.length > 0;
    }

    var canUseWeakMap = typeof WeakMap === 'function' && !(typeof navigator === 'object' &&
        navigator.product === 'ReactNative');

    function compact() {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i] = arguments[_i];
        }
        var result = Object.create(null);
        objects.forEach(function (obj) {
            if (!obj)
                return;
            Object.keys(obj).forEach(function (key) {
                var value = obj[key];
                if (value !== void 0) {
                    result[key] = value;
                }
            });
        });
        return result;
    }

    function fromError(errorValue) {
        return new zenObservable(function (observer) {
            observer.error(errorValue);
        });
    }

    var throwServerError = function (response, result, message) {
        var error = new Error(message);
        error.name = 'ServerError';
        error.response = response;
        error.statusCode = response.status;
        error.result = result;
        throw error;
    };

    function validateOperation(operation) {
        var OPERATION_FIELDS = [
            'query',
            'operationName',
            'variables',
            'extensions',
            'context',
        ];
        for (var _i = 0, _a = Object.keys(operation); _i < _a.length; _i++) {
            var key = _a[_i];
            if (OPERATION_FIELDS.indexOf(key) < 0) {
                throw process.env.NODE_ENV === "production" ? new InvariantError(26) : new InvariantError("illegal argument: " + key);
            }
        }
        return operation;
    }

    function createOperation(starting, operation) {
        var context = __assign$2({}, starting);
        var setContext = function (next) {
            if (typeof next === 'function') {
                context = __assign$2(__assign$2({}, context), next(context));
            }
            else {
                context = __assign$2(__assign$2({}, context), next);
            }
        };
        var getContext = function () { return (__assign$2({}, context)); };
        Object.defineProperty(operation, 'setContext', {
            enumerable: false,
            value: setContext,
        });
        Object.defineProperty(operation, 'getContext', {
            enumerable: false,
            value: getContext,
        });
        return operation;
    }

    function transformOperation(operation) {
        var transformedOperation = {
            variables: operation.variables || {},
            extensions: operation.extensions || {},
            operationName: operation.operationName,
            query: operation.query,
        };
        if (!transformedOperation.operationName) {
            transformedOperation.operationName =
                typeof transformedOperation.query !== 'string'
                    ? getOperationName(transformedOperation.query) || undefined
                    : '';
        }
        return transformedOperation;
    }

    function passthrough(op, forward) {
        return (forward ? forward(op) : zenObservable.of());
    }
    function toLink(handler) {
        return typeof handler === 'function' ? new ApolloLink(handler) : handler;
    }
    function isTerminating(link) {
        return link.request.length <= 1;
    }
    var LinkError = (function (_super) {
        __extends$1(LinkError, _super);
        function LinkError(message, link) {
            var _this = _super.call(this, message) || this;
            _this.link = link;
            return _this;
        }
        return LinkError;
    }(Error));
    var ApolloLink = (function () {
        function ApolloLink(request) {
            if (request)
                this.request = request;
        }
        ApolloLink.empty = function () {
            return new ApolloLink(function () { return zenObservable.of(); });
        };
        ApolloLink.from = function (links) {
            if (links.length === 0)
                return ApolloLink.empty();
            return links.map(toLink).reduce(function (x, y) { return x.concat(y); });
        };
        ApolloLink.split = function (test, left, right) {
            var leftLink = toLink(left);
            var rightLink = toLink(right || new ApolloLink(passthrough));
            if (isTerminating(leftLink) && isTerminating(rightLink)) {
                return new ApolloLink(function (operation) {
                    return test(operation)
                        ? leftLink.request(operation) || zenObservable.of()
                        : rightLink.request(operation) || zenObservable.of();
                });
            }
            else {
                return new ApolloLink(function (operation, forward) {
                    return test(operation)
                        ? leftLink.request(operation, forward) || zenObservable.of()
                        : rightLink.request(operation, forward) || zenObservable.of();
                });
            }
        };
        ApolloLink.execute = function (link, operation) {
            return (link.request(createOperation(operation.context, transformOperation(validateOperation(operation)))) || zenObservable.of());
        };
        ApolloLink.concat = function (first, second) {
            var firstLink = toLink(first);
            if (isTerminating(firstLink)) {
                process.env.NODE_ENV === "production" || invariant.warn(new LinkError("You are calling concat on a terminating link, which will have no effect", firstLink));
                return firstLink;
            }
            var nextLink = toLink(second);
            if (isTerminating(nextLink)) {
                return new ApolloLink(function (operation) {
                    return firstLink.request(operation, function (op) { return nextLink.request(op) || zenObservable.of(); }) || zenObservable.of();
                });
            }
            else {
                return new ApolloLink(function (operation, forward) {
                    return (firstLink.request(operation, function (op) {
                        return nextLink.request(op, forward) || zenObservable.of();
                    }) || zenObservable.of());
                });
            }
        };
        ApolloLink.prototype.split = function (test, left, right) {
            return this.concat(ApolloLink.split(test, left, right || new ApolloLink(passthrough)));
        };
        ApolloLink.prototype.concat = function (next) {
            return ApolloLink.concat(this, next);
        };
        ApolloLink.prototype.request = function (operation, forward) {
            throw process.env.NODE_ENV === "production" ? new InvariantError(21) : new InvariantError('request is not implemented');
        };
        ApolloLink.prototype.onError = function (error, observer) {
            if (observer && observer.error) {
                observer.error(error);
                return false;
            }
            throw error;
        };
        ApolloLink.prototype.setOnError = function (fn) {
            this.onError = fn;
            return this;
        };
        return ApolloLink;
    }());

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    function parseAndCheckHttpResponse(operations) {
        return function (response) { return response
            .text()
            .then(function (bodyText) {
            try {
                return JSON.parse(bodyText);
            }
            catch (err) {
                var parseError = err;
                parseError.name = 'ServerParseError';
                parseError.response = response;
                parseError.statusCode = response.status;
                parseError.bodyText = bodyText;
                throw parseError;
            }
        })
            .then(function (result) {
            if (response.status >= 300) {
                throwServerError(response, result, "Response not successful: Received status code " + response.status);
            }
            if (!Array.isArray(result) &&
                !hasOwnProperty$1.call(result, 'data') &&
                !hasOwnProperty$1.call(result, 'errors')) {
                throwServerError(response, result, "Server response was missing for query '" + (Array.isArray(operations)
                    ? operations.map(function (op) { return op.operationName; })
                    : operations.operationName) + "'.");
            }
            return result;
        }); };
    }

    var serializeFetchParameter = function (p, label) {
        var serialized;
        try {
            serialized = JSON.stringify(p);
        }
        catch (e) {
            var parseError = process.env.NODE_ENV === "production" ? new InvariantError(23) : new InvariantError("Network request failed. " + label + " is not serializable: " + e.message);
            parseError.parseError = e;
            throw parseError;
        }
        return serialized;
    };

    var defaultHttpOptions = {
        includeQuery: true,
        includeExtensions: false,
    };
    var defaultHeaders = {
        accept: '*/*',
        'content-type': 'application/json',
    };
    var defaultOptions = {
        method: 'POST',
    };
    var fallbackHttpConfig = {
        http: defaultHttpOptions,
        headers: defaultHeaders,
        options: defaultOptions,
    };
    var selectHttpOptionsAndBody = function (operation, fallbackConfig) {
        var configs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            configs[_i - 2] = arguments[_i];
        }
        var options = __assign$2(__assign$2({}, fallbackConfig.options), { headers: fallbackConfig.headers, credentials: fallbackConfig.credentials });
        var http = fallbackConfig.http || {};
        configs.forEach(function (config) {
            options = __assign$2(__assign$2(__assign$2({}, options), config.options), { headers: __assign$2(__assign$2({}, options.headers), config.headers) });
            if (config.credentials)
                options.credentials = config.credentials;
            http = __assign$2(__assign$2({}, http), config.http);
        });
        var operationName = operation.operationName, extensions = operation.extensions, variables = operation.variables, query = operation.query;
        var body = { operationName: operationName, variables: variables };
        if (http.includeExtensions)
            body.extensions = extensions;
        if (http.includeQuery)
            body.query = print(query);
        return {
            options: options,
            body: body,
        };
    };

    var checkFetcher = function (fetcher) {
        if (!fetcher && typeof fetch === 'undefined') {
            throw process.env.NODE_ENV === "production" ? new InvariantError(22) : new InvariantError("\n\"fetch\" has not been found globally and no fetcher has been configured. To fix this, install a fetch package (like https://www.npmjs.com/package/cross-fetch), instantiate the fetcher, and pass it into your HttpLink constructor. For example:\n\nimport fetch from 'cross-fetch';\nimport { ApolloClient, HttpLink } from '@apollo/client';\nconst client = new ApolloClient({\n  link: new HttpLink({ uri: '/graphql', fetch })\n});\n    ");
        }
    };

    var createSignalIfSupported = function () {
        if (typeof AbortController === 'undefined')
            return { controller: false, signal: false };
        var controller = new AbortController();
        var signal = controller.signal;
        return { controller: controller, signal: signal };
    };

    var selectURI = function (operation, fallbackURI) {
        var context = operation.getContext();
        var contextURI = context.uri;
        if (contextURI) {
            return contextURI;
        }
        else if (typeof fallbackURI === 'function') {
            return fallbackURI(operation);
        }
        else {
            return fallbackURI || '/graphql';
        }
    };

    function rewriteURIForGET(chosenURI, body) {
        var queryParams = [];
        var addQueryParam = function (key, value) {
            queryParams.push(key + "=" + encodeURIComponent(value));
        };
        if ('query' in body) {
            addQueryParam('query', body.query);
        }
        if (body.operationName) {
            addQueryParam('operationName', body.operationName);
        }
        if (body.variables) {
            var serializedVariables = void 0;
            try {
                serializedVariables = serializeFetchParameter(body.variables, 'Variables map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('variables', serializedVariables);
        }
        if (body.extensions) {
            var serializedExtensions = void 0;
            try {
                serializedExtensions = serializeFetchParameter(body.extensions, 'Extensions map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('extensions', serializedExtensions);
        }
        var fragment = '', preFragment = chosenURI;
        var fragmentStart = chosenURI.indexOf('#');
        if (fragmentStart !== -1) {
            fragment = chosenURI.substr(fragmentStart);
            preFragment = chosenURI.substr(0, fragmentStart);
        }
        var queryParamsPrefix = preFragment.indexOf('?') === -1 ? '?' : '&';
        var newURI = preFragment + queryParamsPrefix + queryParams.join('&') + fragment;
        return { newURI: newURI };
    }

    var createHttpLink = function (linkOptions) {
        if (linkOptions === void 0) { linkOptions = {}; }
        var _a = linkOptions.uri, uri = _a === void 0 ? '/graphql' : _a, fetcher = linkOptions.fetch, includeExtensions = linkOptions.includeExtensions, useGETForQueries = linkOptions.useGETForQueries, _b = linkOptions.includeUnusedVariables, includeUnusedVariables = _b === void 0 ? false : _b, requestOptions = __rest(linkOptions, ["uri", "fetch", "includeExtensions", "useGETForQueries", "includeUnusedVariables"]);
        checkFetcher(fetcher);
        if (!fetcher) {
            fetcher = fetch;
        }
        var linkConfig = {
            http: { includeExtensions: includeExtensions },
            options: requestOptions.fetchOptions,
            credentials: requestOptions.credentials,
            headers: requestOptions.headers,
        };
        return new ApolloLink(function (operation) {
            var chosenURI = selectURI(operation, uri);
            var context = operation.getContext();
            var clientAwarenessHeaders = {};
            if (context.clientAwareness) {
                var _a = context.clientAwareness, name_1 = _a.name, version = _a.version;
                if (name_1) {
                    clientAwarenessHeaders['apollographql-client-name'] = name_1;
                }
                if (version) {
                    clientAwarenessHeaders['apollographql-client-version'] = version;
                }
            }
            var contextHeaders = __assign$2(__assign$2({}, clientAwarenessHeaders), context.headers);
            var contextConfig = {
                http: context.http,
                options: context.fetchOptions,
                credentials: context.credentials,
                headers: contextHeaders,
            };
            var _b = selectHttpOptionsAndBody(operation, fallbackHttpConfig, linkConfig, contextConfig), options = _b.options, body = _b.body;
            if (body.variables && !includeUnusedVariables) {
                var unusedNames_1 = new Set(Object.keys(body.variables));
                visit(operation.query, {
                    Variable: function (node, _key, parent) {
                        if (parent && parent.kind !== 'VariableDefinition') {
                            unusedNames_1.delete(node.name.value);
                        }
                    },
                });
                if (unusedNames_1.size) {
                    body.variables = __assign$2({}, body.variables);
                    unusedNames_1.forEach(function (name) {
                        delete body.variables[name];
                    });
                }
            }
            var controller;
            if (!options.signal) {
                var _c = createSignalIfSupported(), _controller = _c.controller, signal = _c.signal;
                controller = _controller;
                if (controller)
                    options.signal = signal;
            }
            var definitionIsMutation = function (d) {
                return d.kind === 'OperationDefinition' && d.operation === 'mutation';
            };
            if (useGETForQueries &&
                !operation.query.definitions.some(definitionIsMutation)) {
                options.method = 'GET';
            }
            if (options.method === 'GET') {
                var _d = rewriteURIForGET(chosenURI, body), newURI = _d.newURI, parseError = _d.parseError;
                if (parseError) {
                    return fromError(parseError);
                }
                chosenURI = newURI;
            }
            else {
                try {
                    options.body = serializeFetchParameter(body, 'Payload');
                }
                catch (parseError) {
                    return fromError(parseError);
                }
            }
            return new zenObservable(function (observer) {
                fetcher(chosenURI, options)
                    .then(function (response) {
                    operation.setContext({ response: response });
                    return response;
                })
                    .then(parseAndCheckHttpResponse(operation))
                    .then(function (result) {
                    observer.next(result);
                    observer.complete();
                    return result;
                })
                    .catch(function (err) {
                    if (err.name === 'AbortError')
                        return;
                    if (err.result && err.result.errors && err.result.data) {
                        observer.next(err.result);
                    }
                    observer.error(err);
                });
                return function () {
                    if (controller)
                        controller.abort();
                };
            });
        });
    };

    ((function (_super) {
        __extends$1(HttpLink, _super);
        function HttpLink(options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, createHttpLink(options).request) || this;
            _this.options = options;
            return _this;
        }
        return HttpLink;
    })(ApolloLink));

    var _a$1 = Object.prototype, toString = _a$1.toString, hasOwnProperty = _a$1.hasOwnProperty;
    var fnToStr = Function.prototype.toString;
    var previousComparisons = new Map();
    /**
     * Performs a deep equality check on two JavaScript values, tolerating cycles.
     */
    function equal(a, b) {
        try {
            return check(a, b);
        }
        finally {
            previousComparisons.clear();
        }
    }
    function check(a, b) {
        // If the two values are strictly equal, our job is easy.
        if (a === b) {
            return true;
        }
        // Object.prototype.toString returns a representation of the runtime type of
        // the given value that is considerably more precise than typeof.
        var aTag = toString.call(a);
        var bTag = toString.call(b);
        // If the runtime types of a and b are different, they could maybe be equal
        // under some interpretation of equality, but for simplicity and performance
        // we just return false instead.
        if (aTag !== bTag) {
            return false;
        }
        switch (aTag) {
            case '[object Array]':
                // Arrays are a lot like other objects, but we can cheaply compare their
                // lengths as a short-cut before comparing their elements.
                if (a.length !== b.length)
                    return false;
            // Fall through to object case...
            case '[object Object]': {
                if (previouslyCompared(a, b))
                    return true;
                var aKeys = definedKeys(a);
                var bKeys = definedKeys(b);
                // If `a` and `b` have a different number of enumerable keys, they
                // must be different.
                var keyCount = aKeys.length;
                if (keyCount !== bKeys.length)
                    return false;
                // Now make sure they have the same keys.
                for (var k = 0; k < keyCount; ++k) {
                    if (!hasOwnProperty.call(b, aKeys[k])) {
                        return false;
                    }
                }
                // Finally, check deep equality of all child properties.
                for (var k = 0; k < keyCount; ++k) {
                    var key = aKeys[k];
                    if (!check(a[key], b[key])) {
                        return false;
                    }
                }
                return true;
            }
            case '[object Error]':
                return a.name === b.name && a.message === b.message;
            case '[object Number]':
                // Handle NaN, which is !== itself.
                if (a !== a)
                    return b !== b;
            // Fall through to shared +a === +b case...
            case '[object Boolean]':
            case '[object Date]':
                return +a === +b;
            case '[object RegExp]':
            case '[object String]':
                return a == "" + b;
            case '[object Map]':
            case '[object Set]': {
                if (a.size !== b.size)
                    return false;
                if (previouslyCompared(a, b))
                    return true;
                var aIterator = a.entries();
                var isMap = aTag === '[object Map]';
                while (true) {
                    var info = aIterator.next();
                    if (info.done)
                        break;
                    // If a instanceof Set, aValue === aKey.
                    var _a = info.value, aKey = _a[0], aValue = _a[1];
                    // So this works the same way for both Set and Map.
                    if (!b.has(aKey)) {
                        return false;
                    }
                    // However, we care about deep equality of values only when dealing
                    // with Map structures.
                    if (isMap && !check(aValue, b.get(aKey))) {
                        return false;
                    }
                }
                return true;
            }
            case '[object AsyncFunction]':
            case '[object GeneratorFunction]':
            case '[object AsyncGeneratorFunction]':
            case '[object Function]': {
                var aCode = fnToStr.call(a);
                if (aCode !== fnToStr.call(b)) {
                    return false;
                }
                // We consider non-native functions equal if they have the same code
                // (native functions require === because their code is censored).
                // Note that this behavior is not entirely sound, since !== function
                // objects with the same code can behave differently depending on
                // their closure scope. However, any function can behave differently
                // depending on the values of its input arguments (including this)
                // and its calling context (including its closure scope), even
                // though the function object is === to itself; and it is entirely
                // possible for functions that are not === to behave exactly the
                // same under all conceivable circumstances. Because none of these
                // factors are statically decidable in JavaScript, JS function
                // equality is not well-defined. This ambiguity allows us to
                // consider the best possible heuristic among various imperfect
                // options, and equating non-native functions that have the same
                // code has enormous practical benefits, such as when comparing
                // functions that are repeatedly passed as fresh function
                // expressions within objects that are otherwise deeply equal. Since
                // any function created from the same syntactic expression (in the
                // same code location) will always stringify to the same code
                // according to fnToStr.call, we can reasonably expect these
                // repeatedly passed function expressions to have the same code, and
                // thus behave "the same" (with all the caveats mentioned above),
                // even though the runtime function objects are !== to one another.
                return !endsWith(aCode, nativeCodeSuffix);
            }
        }
        // Otherwise the values are not equal.
        return false;
    }
    function definedKeys(obj) {
        // Remember that the second argument to Array.prototype.filter will be
        // used as `this` within the callback function.
        return Object.keys(obj).filter(isDefinedKey, obj);
    }
    function isDefinedKey(key) {
        return this[key] !== void 0;
    }
    var nativeCodeSuffix = "{ [native code] }";
    function endsWith(full, suffix) {
        var fromIndex = full.length - suffix.length;
        return fromIndex >= 0 &&
            full.indexOf(suffix, fromIndex) === fromIndex;
    }
    function previouslyCompared(a, b) {
        // Though cyclic references can make an object graph appear infinite from the
        // perspective of a depth-first traversal, the graph still contains a finite
        // number of distinct object references. We use the previousComparisons cache
        // to avoid comparing the same pair of object references more than once, which
        // guarantees termination (even if we end up comparing every object in one
        // graph to every object in the other graph, which is extremely unlikely),
        // while still allowing weird isomorphic structures (like rings with different
        // lengths) a chance to pass the equality test.
        var bSet = previousComparisons.get(a);
        if (bSet) {
            // Return true here because we can be sure false will be returned somewhere
            // else if the objects are not equivalent.
            if (bSet.has(b))
                return true;
        }
        else {
            previousComparisons.set(a, bSet = new Set);
        }
        bSet.add(b);
        return false;
    }

    var generateErrorMessage = function (err) {
        var message = '';
        if (isNonEmptyArray(err.graphQLErrors)) {
            err.graphQLErrors.forEach(function (graphQLError) {
                var errorMessage = graphQLError
                    ? graphQLError.message
                    : 'Error message not found.';
                message += errorMessage + "\n";
            });
        }
        if (err.networkError) {
            message += err.networkError.message + "\n";
        }
        message = message.replace(/\n$/, '');
        return message;
    };
    var ApolloError = (function (_super) {
        __extends$1(ApolloError, _super);
        function ApolloError(_a) {
            var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError, errorMessage = _a.errorMessage, extraInfo = _a.extraInfo;
            var _this = _super.call(this, errorMessage) || this;
            _this.graphQLErrors = graphQLErrors || [];
            _this.networkError = networkError || null;
            _this.message = errorMessage || generateErrorMessage(_this);
            _this.extraInfo = extraInfo;
            _this.__proto__ = ApolloError.prototype;
            return _this;
        }
        return ApolloError;
    }(Error));

    var NetworkStatus;
    (function (NetworkStatus) {
        NetworkStatus[NetworkStatus["loading"] = 1] = "loading";
        NetworkStatus[NetworkStatus["setVariables"] = 2] = "setVariables";
        NetworkStatus[NetworkStatus["fetchMore"] = 3] = "fetchMore";
        NetworkStatus[NetworkStatus["refetch"] = 4] = "refetch";
        NetworkStatus[NetworkStatus["poll"] = 6] = "poll";
        NetworkStatus[NetworkStatus["ready"] = 7] = "ready";
        NetworkStatus[NetworkStatus["error"] = 8] = "error";
    })(NetworkStatus || (NetworkStatus = {}));
    function isNetworkRequestInFlight(networkStatus) {
        return networkStatus ? networkStatus < 7 : false;
    }

    var Reobserver = (function () {
        function Reobserver(observer, options, fetch, shouldFetch) {
            this.observer = observer;
            this.options = options;
            this.fetch = fetch;
            this.shouldFetch = shouldFetch;
        }
        Reobserver.prototype.reobserve = function (newOptions, newNetworkStatus) {
            if (newOptions) {
                this.updateOptions(newOptions);
            }
            else {
                this.updatePolling();
            }
            var concast = this.fetch(this.options, newNetworkStatus);
            if (this.concast) {
                this.concast.removeObserver(this.observer, true);
            }
            concast.addObserver(this.observer);
            return (this.concast = concast).promise;
        };
        Reobserver.prototype.updateOptions = function (newOptions) {
            Object.assign(this.options, compact(newOptions));
            this.updatePolling();
            return this;
        };
        Reobserver.prototype.stop = function () {
            if (this.concast) {
                this.concast.removeObserver(this.observer);
                delete this.concast;
            }
            if (this.pollingInfo) {
                clearTimeout(this.pollingInfo.timeout);
                this.options.pollInterval = 0;
                this.updatePolling();
            }
        };
        Reobserver.prototype.updatePolling = function () {
            var _this = this;
            var _a = this, pollingInfo = _a.pollingInfo, pollInterval = _a.options.pollInterval;
            if (!pollInterval) {
                if (pollingInfo) {
                    clearTimeout(pollingInfo.timeout);
                    delete this.pollingInfo;
                }
                return;
            }
            if (pollingInfo &&
                pollingInfo.interval === pollInterval) {
                return;
            }
            process.env.NODE_ENV === "production" ? invariant(pollInterval, 20) : invariant(pollInterval, 'Attempted to start a polling query without a polling interval.');
            if (this.shouldFetch === false) {
                return;
            }
            var info = pollingInfo || (this.pollingInfo = {});
            info.interval = pollInterval;
            var maybeFetch = function () {
                if (_this.pollingInfo) {
                    if (_this.shouldFetch && _this.shouldFetch()) {
                        _this.reobserve({
                            fetchPolicy: "network-only",
                            nextFetchPolicy: _this.options.fetchPolicy || "cache-first",
                        }, NetworkStatus.poll).then(poll, poll);
                    }
                    else {
                        poll();
                    }
                }
            };
            var poll = function () {
                var info = _this.pollingInfo;
                if (info) {
                    clearTimeout(info.timeout);
                    info.timeout = setTimeout(maybeFetch, info.interval);
                }
            };
            poll();
        };
        return Reobserver;
    }());

    var warnedAboutUpdateQuery = false;
    var ObservableQuery = (function (_super) {
        __extends$1(ObservableQuery, _super);
        function ObservableQuery(_a) {
            var queryManager = _a.queryManager, queryInfo = _a.queryInfo, options = _a.options;
            var _this = _super.call(this, function (observer) {
                return _this.onSubscribe(observer);
            }) || this;
            _this.observers = new Set();
            _this.subscriptions = new Set();
            _this.observer = {
                next: function (result) {
                    if (_this.lastError || _this.isDifferentFromLastResult(result)) {
                        _this.updateLastResult(result);
                        iterateObserversSafely(_this.observers, 'next', result);
                    }
                },
                error: function (error) {
                    _this.updateLastResult(__assign$2(__assign$2({}, _this.lastResult), { error: error, errors: error.graphQLErrors, networkStatus: NetworkStatus.error, loading: false }));
                    iterateObserversSafely(_this.observers, 'error', _this.lastError = error);
                },
            };
            _this.isTornDown = false;
            _this.options = options;
            _this.queryId = queryManager.generateQueryId();
            var opDef = getOperationDefinition(options.query);
            _this.queryName = opDef && opDef.name && opDef.name.value;
            _this.queryManager = queryManager;
            _this.queryInfo = queryInfo;
            return _this;
        }
        Object.defineProperty(ObservableQuery.prototype, "variables", {
            get: function () {
                return this.options.variables;
            },
            enumerable: false,
            configurable: true
        });
        ObservableQuery.prototype.result = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var observer = {
                    next: function (result) {
                        resolve(result);
                        _this.observers.delete(observer);
                        if (!_this.observers.size) {
                            _this.queryManager.removeQuery(_this.queryId);
                        }
                        setTimeout(function () {
                            subscription.unsubscribe();
                        }, 0);
                    },
                    error: reject,
                };
                var subscription = _this.subscribe(observer);
            });
        };
        ObservableQuery.prototype.getCurrentResult = function (saveAsLastResult) {
            if (saveAsLastResult === void 0) { saveAsLastResult = true; }
            var lastResult = this.lastResult;
            var networkStatus = this.queryInfo.networkStatus ||
                (lastResult && lastResult.networkStatus) ||
                NetworkStatus.ready;
            var result = __assign$2(__assign$2({}, lastResult), { loading: isNetworkRequestInFlight(networkStatus), networkStatus: networkStatus });
            if (this.isTornDown) {
                return result;
            }
            var _a = this.options.fetchPolicy, fetchPolicy = _a === void 0 ? 'cache-first' : _a;
            if (fetchPolicy === 'no-cache' ||
                fetchPolicy === 'network-only') {
                delete result.partial;
            }
            else if (!result.data ||
                !this.queryManager.transform(this.options.query).hasForcedResolvers) {
                var diff = this.queryInfo.getDiff();
                result.data = (diff.complete ||
                    this.options.returnPartialData) ? diff.result : void 0;
                if (diff.complete) {
                    if (result.networkStatus === NetworkStatus.loading &&
                        (fetchPolicy === 'cache-first' ||
                            fetchPolicy === 'cache-only')) {
                        result.networkStatus = NetworkStatus.ready;
                        result.loading = false;
                    }
                    delete result.partial;
                }
                else {
                    result.partial = true;
                }
            }
            if (saveAsLastResult) {
                this.updateLastResult(result);
            }
            return result;
        };
        ObservableQuery.prototype.isDifferentFromLastResult = function (newResult) {
            return !equal(this.lastResultSnapshot, newResult);
        };
        ObservableQuery.prototype.getLastResult = function () {
            return this.lastResult;
        };
        ObservableQuery.prototype.getLastError = function () {
            return this.lastError;
        };
        ObservableQuery.prototype.resetLastResults = function () {
            delete this.lastResult;
            delete this.lastResultSnapshot;
            delete this.lastError;
            this.isTornDown = false;
        };
        ObservableQuery.prototype.resetQueryStoreErrors = function () {
            this.queryManager.resetErrors(this.queryId);
        };
        ObservableQuery.prototype.refetch = function (variables) {
            var reobserveOptions = {
                pollInterval: 0,
            };
            var fetchPolicy = this.options.fetchPolicy;
            if (fetchPolicy !== 'no-cache' &&
                fetchPolicy !== 'cache-and-network') {
                reobserveOptions.fetchPolicy = 'network-only';
                reobserveOptions.nextFetchPolicy = fetchPolicy || "cache-first";
            }
            if (variables && !equal(this.options.variables, variables)) {
                reobserveOptions.variables = this.options.variables = __assign$2(__assign$2({}, this.options.variables), variables);
            }
            return this.newReobserver(false).reobserve(reobserveOptions, NetworkStatus.refetch);
        };
        ObservableQuery.prototype.fetchMore = function (fetchMoreOptions) {
            var _this = this;
            var combinedOptions = __assign$2(__assign$2({}, (fetchMoreOptions.query ? fetchMoreOptions : __assign$2(__assign$2(__assign$2({}, this.options), fetchMoreOptions), { variables: __assign$2(__assign$2({}, this.options.variables), fetchMoreOptions.variables) }))), { fetchPolicy: "no-cache" });
            var qid = this.queryManager.generateQueryId();
            if (combinedOptions.notifyOnNetworkStatusChange) {
                this.queryInfo.networkStatus = NetworkStatus.fetchMore;
                this.observe();
            }
            return this.queryManager.fetchQuery(qid, combinedOptions, NetworkStatus.fetchMore).then(function (fetchMoreResult) {
                var data = fetchMoreResult.data;
                var updateQuery = fetchMoreOptions.updateQuery;
                if (updateQuery) {
                    if (process.env.NODE_ENV !== "production" &&
                        !warnedAboutUpdateQuery) {
                        process.env.NODE_ENV === "production" || invariant.warn("The updateQuery callback for fetchMore is deprecated, and will be removed\nin the next major version of Apollo Client.\n\nPlease convert updateQuery functions to field policies with appropriate\nread and merge functions, or use/adapt a helper function (such as\nconcatPagination, offsetLimitPagination, or relayStylePagination) from\n@apollo/client/utilities.\n\nThe field policy system handles pagination more effectively than a\nhand-written updateQuery function, and you only need to define the policy\nonce, rather than every time you call fetchMore.");
                        warnedAboutUpdateQuery = true;
                    }
                    _this.updateQuery(function (previous) { return updateQuery(previous, {
                        fetchMoreResult: data,
                        variables: combinedOptions.variables,
                    }); });
                }
                else {
                    _this.queryManager.cache.writeQuery({
                        query: combinedOptions.query,
                        variables: combinedOptions.variables,
                        data: data,
                    });
                }
                return fetchMoreResult;
            }).finally(function () {
                _this.queryManager.stopQuery(qid);
                _this.reobserve();
            });
        };
        ObservableQuery.prototype.subscribeToMore = function (options) {
            var _this = this;
            var subscription = this.queryManager
                .startGraphQLSubscription({
                query: options.document,
                variables: options.variables,
                context: options.context,
            })
                .subscribe({
                next: function (subscriptionData) {
                    var updateQuery = options.updateQuery;
                    if (updateQuery) {
                        _this.updateQuery(function (previous, _a) {
                            var variables = _a.variables;
                            return updateQuery(previous, {
                                subscriptionData: subscriptionData,
                                variables: variables,
                            });
                        });
                    }
                },
                error: function (err) {
                    if (options.onError) {
                        options.onError(err);
                        return;
                    }
                    process.env.NODE_ENV === "production" || invariant.error('Unhandled GraphQL subscription error', err);
                },
            });
            this.subscriptions.add(subscription);
            return function () {
                if (_this.subscriptions.delete(subscription)) {
                    subscription.unsubscribe();
                }
            };
        };
        ObservableQuery.prototype.setOptions = function (newOptions) {
            return this.reobserve(newOptions);
        };
        ObservableQuery.prototype.setVariables = function (variables) {
            if (equal(this.variables, variables)) {
                return this.observers.size
                    ? this.result()
                    : Promise.resolve();
            }
            this.options.variables = variables;
            if (!this.observers.size) {
                return Promise.resolve();
            }
            var _a = this.options.fetchPolicy, fetchPolicy = _a === void 0 ? 'cache-first' : _a;
            var reobserveOptions = {
                fetchPolicy: fetchPolicy,
                variables: variables,
            };
            if (fetchPolicy !== 'cache-first' &&
                fetchPolicy !== 'no-cache' &&
                fetchPolicy !== 'network-only') {
                reobserveOptions.fetchPolicy = 'cache-and-network';
                reobserveOptions.nextFetchPolicy = fetchPolicy;
            }
            return this.reobserve(reobserveOptions, NetworkStatus.setVariables);
        };
        ObservableQuery.prototype.updateQuery = function (mapFn) {
            var _a;
            var queryManager = this.queryManager;
            var result = queryManager.cache.diff({
                query: this.options.query,
                variables: this.variables,
                previousResult: (_a = this.lastResult) === null || _a === void 0 ? void 0 : _a.data,
                returnPartialData: true,
                optimistic: false,
            }).result;
            var newResult = mapFn(result, {
                variables: this.variables,
            });
            if (newResult) {
                queryManager.cache.writeQuery({
                    query: this.options.query,
                    data: newResult,
                    variables: this.variables,
                });
                queryManager.broadcastQueries();
            }
        };
        ObservableQuery.prototype.startPolling = function (pollInterval) {
            this.getReobserver().updateOptions({ pollInterval: pollInterval });
        };
        ObservableQuery.prototype.stopPolling = function () {
            if (this.reobserver) {
                this.reobserver.updateOptions({ pollInterval: 0 });
            }
        };
        ObservableQuery.prototype.updateLastResult = function (newResult) {
            var previousResult = this.lastResult;
            this.lastResult = newResult;
            this.lastResultSnapshot = this.queryManager.assumeImmutableResults
                ? newResult
                : cloneDeep(newResult);
            if (!isNonEmptyArray(newResult.errors)) {
                delete this.lastError;
            }
            return previousResult;
        };
        ObservableQuery.prototype.onSubscribe = function (observer) {
            var _this = this;
            if (observer === this.observer) {
                return function () { };
            }
            try {
                var subObserver = observer._subscription._observer;
                if (subObserver && !subObserver.error) {
                    subObserver.error = defaultSubscriptionObserverErrorCallback;
                }
            }
            catch (_a) { }
            var first = !this.observers.size;
            this.observers.add(observer);
            if (this.lastError) {
                observer.error && observer.error(this.lastError);
            }
            else if (this.lastResult) {
                observer.next && observer.next(this.lastResult);
            }
            if (first) {
                this.reobserve().catch(function (_) {
                });
            }
            return function () {
                if (_this.observers.delete(observer) && !_this.observers.size) {
                    _this.tearDownQuery();
                }
            };
        };
        ObservableQuery.prototype.getReobserver = function () {
            return this.reobserver || (this.reobserver = this.newReobserver(true));
        };
        ObservableQuery.prototype.newReobserver = function (shareOptions) {
            var _this = this;
            var _a = this, queryManager = _a.queryManager, queryId = _a.queryId;
            queryManager.setObservableQuery(this);
            return new Reobserver(this.observer, shareOptions ? this.options : __assign$2({}, this.options), function (currentOptions, newNetworkStatus) {
                queryManager.setObservableQuery(_this);
                return queryManager.fetchQueryObservable(queryId, currentOptions, newNetworkStatus);
            }, !queryManager.ssrMode && (function () { return !isNetworkRequestInFlight(_this.queryInfo.networkStatus); }));
        };
        ObservableQuery.prototype.reobserve = function (newOptions, newNetworkStatus) {
            this.isTornDown = false;
            return this.getReobserver().reobserve(newOptions, newNetworkStatus);
        };
        ObservableQuery.prototype.observe = function () {
            this.observer.next(this.getCurrentResult(false));
        };
        ObservableQuery.prototype.hasObservers = function () {
            return this.observers.size > 0;
        };
        ObservableQuery.prototype.tearDownQuery = function () {
            if (this.isTornDown)
                return;
            if (this.reobserver) {
                this.reobserver.stop();
                delete this.reobserver;
            }
            this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
            this.subscriptions.clear();
            this.queryManager.stopQuery(this.queryId);
            this.observers.clear();
            this.isTornDown = true;
        };
        return ObservableQuery;
    }(zenObservable));
    fixObservableSubclass(ObservableQuery);
    function defaultSubscriptionObserverErrorCallback(error) {
        process.env.NODE_ENV === "production" || invariant.error('Unhandled error', error.message, error.stack);
    }

    // A [trie](https://en.wikipedia.org/wiki/Trie) data structure that holds
    // object keys weakly, yet can also hold non-object keys, unlike the
    // native `WeakMap`.
    // If no makeData function is supplied, the looked-up data will be an empty,
    // null-prototype Object.
    var defaultMakeData = function () { return Object.create(null); };
    // Useful for processing arguments objects as well as arrays.
    var _a = Array.prototype, forEach = _a.forEach, slice = _a.slice;
    var Trie = /** @class */ (function () {
        function Trie(weakness, makeData) {
            if (weakness === void 0) { weakness = true; }
            if (makeData === void 0) { makeData = defaultMakeData; }
            this.weakness = weakness;
            this.makeData = makeData;
        }
        Trie.prototype.lookup = function () {
            var array = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                array[_i] = arguments[_i];
            }
            return this.lookupArray(array);
        };
        Trie.prototype.lookupArray = function (array) {
            var node = this;
            forEach.call(array, function (key) { return node = node.getChildTrie(key); });
            return node.data || (node.data = this.makeData(slice.call(array)));
        };
        Trie.prototype.getChildTrie = function (key) {
            var map = this.weakness && isObjRef(key)
                ? this.weak || (this.weak = new WeakMap())
                : this.strong || (this.strong = new Map());
            var child = map.get(key);
            if (!child)
                map.set(key, child = new Trie(this.weakness, this.makeData));
            return child;
        };
        return Trie;
    }());
    function isObjRef(value) {
        switch (typeof value) {
            case "object":
                if (value === null)
                    break;
            // Fall through to return true...
            case "function":
                return true;
        }
        return false;
    }

    // This currentContext variable will only be used if the makeSlotClass
    // function is called, which happens only if this is the first copy of the
    // @wry/context package to be imported.
    var currentContext = null;
    // This unique internal object is used to denote the absence of a value
    // for a given Slot, and is never exposed to outside code.
    var MISSING_VALUE = {};
    var idCounter = 1;
    // Although we can't do anything about the cost of duplicated code from
    // accidentally bundling multiple copies of the @wry/context package, we can
    // avoid creating the Slot class more than once using makeSlotClass.
    var makeSlotClass = function () { return /** @class */ (function () {
        function Slot() {
            // If you have a Slot object, you can find out its slot.id, but you cannot
            // guess the slot.id of a Slot you don't have access to, thanks to the
            // randomized suffix.
            this.id = [
                "slot",
                idCounter++,
                Date.now(),
                Math.random().toString(36).slice(2),
            ].join(":");
        }
        Slot.prototype.hasValue = function () {
            for (var context_1 = currentContext; context_1; context_1 = context_1.parent) {
                // We use the Slot object iself as a key to its value, which means the
                // value cannot be obtained without a reference to the Slot object.
                if (this.id in context_1.slots) {
                    var value = context_1.slots[this.id];
                    if (value === MISSING_VALUE)
                        break;
                    if (context_1 !== currentContext) {
                        // Cache the value in currentContext.slots so the next lookup will
                        // be faster. This caching is safe because the tree of contexts and
                        // the values of the slots are logically immutable.
                        currentContext.slots[this.id] = value;
                    }
                    return true;
                }
            }
            if (currentContext) {
                // If a value was not found for this Slot, it's never going to be found
                // no matter how many times we look it up, so we might as well cache
                // the absence of the value, too.
                currentContext.slots[this.id] = MISSING_VALUE;
            }
            return false;
        };
        Slot.prototype.getValue = function () {
            if (this.hasValue()) {
                return currentContext.slots[this.id];
            }
        };
        Slot.prototype.withValue = function (value, callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            var _a;
            var slots = (_a = {
                    __proto__: null
                },
                _a[this.id] = value,
                _a);
            var parent = currentContext;
            currentContext = { parent: parent, slots: slots };
            try {
                // Function.prototype.apply allows the arguments array argument to be
                // omitted or undefined, so args! is fine here.
                return callback.apply(thisArg, args);
            }
            finally {
                currentContext = parent;
            }
        };
        // Capture the current context and wrap a callback function so that it
        // reestablishes the captured context when called.
        Slot.bind = function (callback) {
            var context = currentContext;
            return function () {
                var saved = currentContext;
                try {
                    currentContext = context;
                    return callback.apply(this, arguments);
                }
                finally {
                    currentContext = saved;
                }
            };
        };
        // Immediately run a callback function without any captured context.
        Slot.noContext = function (callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            if (currentContext) {
                var saved = currentContext;
                try {
                    currentContext = null;
                    // Function.prototype.apply allows the arguments array argument to be
                    // omitted or undefined, so args! is fine here.
                    return callback.apply(thisArg, args);
                }
                finally {
                    currentContext = saved;
                }
            }
            else {
                return callback.apply(thisArg, args);
            }
        };
        return Slot;
    }()); };
    // We store a single global implementation of the Slot class as a permanent
    // non-enumerable symbol property of the Array constructor. This obfuscation
    // does nothing to prevent access to the Slot class, but at least it ensures
    // the implementation (i.e. currentContext) cannot be tampered with, and all
    // copies of the @wry/context package (hopefully just one) will share the
    // same Slot implementation. Since the first copy of the @wry/context package
    // to be imported wins, this technique imposes a very high cost for any
    // future breaking changes to the Slot class.
    var globalKey = "@wry/context:Slot";
    var host = Array;
    var Slot = host[globalKey] || function () {
        var Slot = makeSlotClass();
        try {
            Object.defineProperty(host, globalKey, {
                value: host[globalKey] = Slot,
                enumerable: false,
                writable: false,
                configurable: false,
            });
        }
        finally {
            return Slot;
        }
    }();

    Slot.bind; Slot.noContext;

    function defaultDispose() { }
    var Cache = /** @class */ (function () {
        function Cache(max, dispose) {
            if (max === void 0) { max = Infinity; }
            if (dispose === void 0) { dispose = defaultDispose; }
            this.max = max;
            this.dispose = dispose;
            this.map = new Map();
            this.newest = null;
            this.oldest = null;
        }
        Cache.prototype.has = function (key) {
            return this.map.has(key);
        };
        Cache.prototype.get = function (key) {
            var node = this.getNode(key);
            return node && node.value;
        };
        Cache.prototype.getNode = function (key) {
            var node = this.map.get(key);
            if (node && node !== this.newest) {
                var older = node.older, newer = node.newer;
                if (newer) {
                    newer.older = older;
                }
                if (older) {
                    older.newer = newer;
                }
                node.older = this.newest;
                node.older.newer = node;
                node.newer = null;
                this.newest = node;
                if (node === this.oldest) {
                    this.oldest = newer;
                }
            }
            return node;
        };
        Cache.prototype.set = function (key, value) {
            var node = this.getNode(key);
            if (node) {
                return node.value = value;
            }
            node = {
                key: key,
                value: value,
                newer: null,
                older: this.newest
            };
            if (this.newest) {
                this.newest.newer = node;
            }
            this.newest = node;
            this.oldest = this.oldest || node;
            this.map.set(key, node);
            return node.value;
        };
        Cache.prototype.clean = function () {
            while (this.oldest && this.map.size > this.max) {
                this.delete(this.oldest.key);
            }
        };
        Cache.prototype.delete = function (key) {
            var node = this.map.get(key);
            if (node) {
                if (node === this.newest) {
                    this.newest = node.older;
                }
                if (node === this.oldest) {
                    this.oldest = node.newer;
                }
                if (node.newer) {
                    node.newer.older = node.older;
                }
                if (node.older) {
                    node.older.newer = node.newer;
                }
                this.map.delete(key);
                this.dispose(node.value, key);
                return true;
            }
            return false;
        };
        return Cache;
    }());

    var parentEntrySlot = new Slot();

    function maybeUnsubscribe(entryOrDep) {
        var unsubscribe = entryOrDep.unsubscribe;
        if (typeof unsubscribe === "function") {
            entryOrDep.unsubscribe = void 0;
            unsubscribe();
        }
    }

    var emptySetPool = [];
    var POOL_TARGET_SIZE = 100;
    // Since this package might be used browsers, we should avoid using the
    // Node built-in assert module.
    function assert(condition, optionalMessage) {
        if (!condition) {
            throw new Error(optionalMessage || "assertion failure");
        }
    }
    function valueIs(a, b) {
        var len = a.length;
        return (
        // Unknown values are not equal to each other.
        len > 0 &&
            // Both values must be ordinary (or both exceptional) to be equal.
            len === b.length &&
            // The underlying value or exception must be the same.
            a[len - 1] === b[len - 1]);
    }
    function valueGet(value) {
        switch (value.length) {
            case 0: throw new Error("unknown value");
            case 1: return value[0];
            case 2: throw value[1];
        }
    }
    function valueCopy(value) {
        return value.slice(0);
    }
    var Entry = /** @class */ (function () {
        function Entry(fn) {
            this.fn = fn;
            this.parents = new Set();
            this.childValues = new Map();
            // When this Entry has children that are dirty, this property becomes
            // a Set containing other Entry objects, borrowed from emptySetPool.
            // When the set becomes empty, it gets recycled back to emptySetPool.
            this.dirtyChildren = null;
            this.dirty = true;
            this.recomputing = false;
            this.value = [];
            this.deps = null;
            ++Entry.count;
        }
        Entry.prototype.peek = function () {
            if (this.value.length === 1 && !mightBeDirty(this)) {
                return this.value[0];
            }
        };
        // This is the most important method of the Entry API, because it
        // determines whether the cached this.value can be returned immediately,
        // or must be recomputed. The overall performance of the caching system
        // depends on the truth of the following observations: (1) this.dirty is
        // usually false, (2) this.dirtyChildren is usually null/empty, and thus
        // (3) valueGet(this.value) is usually returned without recomputation.
        Entry.prototype.recompute = function (args) {
            assert(!this.recomputing, "already recomputing");
            rememberParent(this);
            return mightBeDirty(this)
                ? reallyRecompute(this, args)
                : valueGet(this.value);
        };
        Entry.prototype.setDirty = function () {
            if (this.dirty)
                return;
            this.dirty = true;
            this.value.length = 0;
            reportDirty(this);
            forgetChildren(this);
            // We can go ahead and unsubscribe here, since any further dirty
            // notifications we receive will be redundant, and unsubscribing may
            // free up some resources, e.g. file watchers.
            maybeUnsubscribe(this);
        };
        Entry.prototype.dispose = function () {
            var _this = this;
            forgetChildren(this);
            maybeUnsubscribe(this);
            // Because this entry has been kicked out of the cache (in index.js),
            // we've lost the ability to find out if/when this entry becomes dirty,
            // whether that happens through a subscription, because of a direct call
            // to entry.setDirty(), or because one of its children becomes dirty.
            // Because of this loss of future information, we have to assume the
            // worst (that this entry might have become dirty very soon), so we must
            // immediately mark this entry's parents as dirty. Normally we could
            // just call entry.setDirty() rather than calling parent.setDirty() for
            // each parent, but that would leave this entry in parent.childValues
            // and parent.dirtyChildren, which would prevent the child from being
            // truly forgotten.
            this.parents.forEach(function (parent) {
                parent.setDirty();
                forgetChild(parent, _this);
            });
        };
        Entry.prototype.dependOn = function (dep) {
            dep.add(this);
            if (!this.deps) {
                this.deps = emptySetPool.pop() || new Set();
            }
            this.deps.add(dep);
        };
        Entry.prototype.forgetDeps = function () {
            var _this = this;
            if (this.deps) {
                this.deps.forEach(function (dep) { return dep.delete(_this); });
                this.deps.clear();
                emptySetPool.push(this.deps);
                this.deps = null;
            }
        };
        Entry.count = 0;
        return Entry;
    }());
    function rememberParent(child) {
        var parent = parentEntrySlot.getValue();
        if (parent) {
            child.parents.add(parent);
            if (!parent.childValues.has(child)) {
                parent.childValues.set(child, []);
            }
            if (mightBeDirty(child)) {
                reportDirtyChild(parent, child);
            }
            else {
                reportCleanChild(parent, child);
            }
            return parent;
        }
    }
    function reallyRecompute(entry, args) {
        forgetChildren(entry);
        // Set entry as the parent entry while calling recomputeNewValue(entry).
        parentEntrySlot.withValue(entry, recomputeNewValue, [entry, args]);
        if (maybeSubscribe(entry, args)) {
            // If we successfully recomputed entry.value and did not fail to
            // (re)subscribe, then this Entry is no longer explicitly dirty.
            setClean(entry);
        }
        return valueGet(entry.value);
    }
    function recomputeNewValue(entry, args) {
        entry.recomputing = true;
        // Set entry.value as unknown.
        entry.value.length = 0;
        try {
            // If entry.fn succeeds, entry.value will become a normal Value.
            entry.value[0] = entry.fn.apply(null, args);
        }
        catch (e) {
            // If entry.fn throws, entry.value will become exceptional.
            entry.value[1] = e;
        }
        // Either way, this line is always reached.
        entry.recomputing = false;
    }
    function mightBeDirty(entry) {
        return entry.dirty || !!(entry.dirtyChildren && entry.dirtyChildren.size);
    }
    function setClean(entry) {
        entry.dirty = false;
        if (mightBeDirty(entry)) {
            // This Entry may still have dirty children, in which case we can't
            // let our parents know we're clean just yet.
            return;
        }
        reportClean(entry);
    }
    function reportDirty(child) {
        child.parents.forEach(function (parent) { return reportDirtyChild(parent, child); });
    }
    function reportClean(child) {
        child.parents.forEach(function (parent) { return reportCleanChild(parent, child); });
    }
    // Let a parent Entry know that one of its children may be dirty.
    function reportDirtyChild(parent, child) {
        // Must have called rememberParent(child) before calling
        // reportDirtyChild(parent, child).
        assert(parent.childValues.has(child));
        assert(mightBeDirty(child));
        if (!parent.dirtyChildren) {
            parent.dirtyChildren = emptySetPool.pop() || new Set;
        }
        else if (parent.dirtyChildren.has(child)) {
            // If we already know this child is dirty, then we must have already
            // informed our own parents that we are dirty, so we can terminate
            // the recursion early.
            return;
        }
        parent.dirtyChildren.add(child);
        reportDirty(parent);
    }
    // Let a parent Entry know that one of its children is no longer dirty.
    function reportCleanChild(parent, child) {
        // Must have called rememberChild(child) before calling
        // reportCleanChild(parent, child).
        assert(parent.childValues.has(child));
        assert(!mightBeDirty(child));
        var childValue = parent.childValues.get(child);
        if (childValue.length === 0) {
            parent.childValues.set(child, valueCopy(child.value));
        }
        else if (!valueIs(childValue, child.value)) {
            parent.setDirty();
        }
        removeDirtyChild(parent, child);
        if (mightBeDirty(parent)) {
            return;
        }
        reportClean(parent);
    }
    function removeDirtyChild(parent, child) {
        var dc = parent.dirtyChildren;
        if (dc) {
            dc.delete(child);
            if (dc.size === 0) {
                if (emptySetPool.length < POOL_TARGET_SIZE) {
                    emptySetPool.push(dc);
                }
                parent.dirtyChildren = null;
            }
        }
    }
    // Removes all children from this entry and returns an array of the
    // removed children.
    function forgetChildren(parent) {
        if (parent.childValues.size > 0) {
            parent.childValues.forEach(function (_value, child) {
                forgetChild(parent, child);
            });
        }
        // Remove this parent Entry from any sets to which it was added by the
        // addToSet method.
        parent.forgetDeps();
        // After we forget all our children, this.dirtyChildren must be empty
        // and therefore must have been reset to null.
        assert(parent.dirtyChildren === null);
    }
    function forgetChild(parent, child) {
        child.parents.delete(parent);
        parent.childValues.delete(child);
        removeDirtyChild(parent, child);
    }
    function maybeSubscribe(entry, args) {
        if (typeof entry.subscribe === "function") {
            try {
                maybeUnsubscribe(entry); // Prevent double subscriptions.
                entry.unsubscribe = entry.subscribe.apply(null, args);
            }
            catch (e) {
                // If this Entry has a subscribe function and it threw an exception
                // (or an unsubscribe function it previously returned now throws),
                // return false to indicate that we were not able to subscribe (or
                // unsubscribe), and this Entry should remain dirty.
                entry.setDirty();
                return false;
            }
        }
        // Returning true indicates either that there was no entry.subscribe
        // function or that it succeeded.
        return true;
    }

    function dep(options) {
        var depsByKey = new Map();
        var subscribe = options && options.subscribe;
        function depend(key) {
            var parent = parentEntrySlot.getValue();
            if (parent) {
                var dep_1 = depsByKey.get(key);
                if (!dep_1) {
                    depsByKey.set(key, dep_1 = new Set);
                }
                parent.dependOn(dep_1);
                if (typeof subscribe === "function") {
                    maybeUnsubscribe(dep_1);
                    dep_1.unsubscribe = subscribe(key);
                }
            }
        }
        depend.dirty = function dirty(key) {
            var dep = depsByKey.get(key);
            if (dep) {
                dep.forEach(function (entry) { return entry.setDirty(); });
                depsByKey.delete(key);
                maybeUnsubscribe(dep);
            }
        };
        return depend;
    }

    // The defaultMakeCacheKey function is remarkably powerful, because it gives
    // a unique object for any shallow-identical list of arguments. If you need
    // to implement a custom makeCacheKey function, you may find it helpful to
    // delegate the final work to defaultMakeCacheKey, which is why we export it
    // here. However, you may want to avoid defaultMakeCacheKey if your runtime
    // does not support WeakMap, or you have the ability to return a string key.
    // In those cases, just write your own custom makeCacheKey functions.
    var keyTrie = new Trie(typeof WeakMap === "function");
    function defaultMakeCacheKey() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return keyTrie.lookupArray(args);
    }
    var caches = new Set();
    function wrap(originalFunction, options) {
        if (options === void 0) { options = Object.create(null); }
        var cache = new Cache(options.max || Math.pow(2, 16), function (entry) { return entry.dispose(); });
        var keyArgs = options.keyArgs;
        var makeCacheKey = options.makeCacheKey || defaultMakeCacheKey;
        function optimistic() {
            var key = makeCacheKey.apply(null, keyArgs ? keyArgs.apply(null, arguments) : arguments);
            if (key === void 0) {
                return originalFunction.apply(null, arguments);
            }
            var entry = cache.get(key);
            if (!entry) {
                cache.set(key, entry = new Entry(originalFunction));
                entry.subscribe = options.subscribe;
            }
            var value = entry.recompute(Array.prototype.slice.call(arguments));
            // Move this entry to the front of the least-recently used queue,
            // since we just finished computing its value.
            cache.set(key, entry);
            caches.add(cache);
            // Clean up any excess entries in the cache, but only if there is no
            // active parent entry, meaning we're not in the middle of a larger
            // computation that might be flummoxed by the cleaning.
            if (!parentEntrySlot.hasValue()) {
                caches.forEach(function (cache) { return cache.clean(); });
                caches.clear();
            }
            return value;
        }
        function lookup() {
            var key = makeCacheKey.apply(null, arguments);
            if (key !== void 0) {
                return cache.get(key);
            }
        }
        optimistic.dirty = function () {
            var entry = lookup.apply(null, arguments);
            if (entry) {
                entry.setDirty();
            }
        };
        optimistic.peek = function () {
            var entry = lookup.apply(null, arguments);
            if (entry) {
                return entry.peek();
            }
        };
        optimistic.forget = function () {
            var key = makeCacheKey.apply(null, arguments);
            return key !== void 0 && cache.delete(key);
        };
        return optimistic;
    }

    var ApolloCache = (function () {
        function ApolloCache() {
            this.getFragmentDoc = wrap(getFragmentQueryDocument);
        }
        ApolloCache.prototype.recordOptimisticTransaction = function (transaction, optimisticId) {
            this.performTransaction(transaction, optimisticId);
        };
        ApolloCache.prototype.transformDocument = function (document) {
            return document;
        };
        ApolloCache.prototype.identify = function (object) {
            return;
        };
        ApolloCache.prototype.gc = function () {
            return [];
        };
        ApolloCache.prototype.modify = function (options) {
            return false;
        };
        ApolloCache.prototype.transformForLink = function (document) {
            return document;
        };
        ApolloCache.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = !!options.optimistic; }
            return this.read({
                rootId: options.id || 'ROOT_QUERY',
                query: options.query,
                variables: options.variables,
                returnPartialData: options.returnPartialData,
                optimistic: optimistic,
            });
        };
        ApolloCache.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = !!options.optimistic; }
            return this.read({
                query: this.getFragmentDoc(options.fragment, options.fragmentName),
                variables: options.variables,
                rootId: options.id,
                returnPartialData: options.returnPartialData,
                optimistic: optimistic,
            });
        };
        ApolloCache.prototype.writeQuery = function (options) {
            return this.write({
                dataId: options.id || 'ROOT_QUERY',
                result: options.data,
                query: options.query,
                variables: options.variables,
                broadcast: options.broadcast,
            });
        };
        ApolloCache.prototype.writeFragment = function (options) {
            return this.write({
                dataId: options.id,
                result: options.data,
                variables: options.variables,
                query: this.getFragmentDoc(options.fragment, options.fragmentName),
                broadcast: options.broadcast,
            });
        };
        return ApolloCache;
    }());

    var MissingFieldError = (function () {
        function MissingFieldError(message, path, query, clientOnly, variables) {
            this.message = message;
            this.path = path;
            this.query = query;
            this.clientOnly = clientOnly;
            this.variables = variables;
        }
        return MissingFieldError;
    }());

    var hasOwn = Object.prototype.hasOwnProperty;
    function getTypenameFromStoreObject(store, objectOrReference) {
        return isReference(objectOrReference)
            ? store.get(objectOrReference.__ref, "__typename")
            : objectOrReference && objectOrReference.__typename;
    }
    var TypeOrFieldNameRegExp = /^[_a-z][_0-9a-z]*/i;
    function fieldNameFromStoreName(storeFieldName) {
        var match = storeFieldName.match(TypeOrFieldNameRegExp);
        return match ? match[0] : storeFieldName;
    }
    function selectionSetMatchesResult(selectionSet, result, variables) {
        if (result && typeof result === "object") {
            return Array.isArray(result)
                ? result.every(function (item) { return selectionSetMatchesResult(selectionSet, item, variables); })
                : selectionSet.selections.every(function (field) {
                    if (isField(field) && shouldInclude(field, variables)) {
                        var key = resultKeyNameFromField(field);
                        return hasOwn.call(result, key) &&
                            (!field.selectionSet ||
                                selectionSetMatchesResult(field.selectionSet, result[key], variables));
                    }
                    return true;
                });
        }
        return false;
    }
    function storeValueIsStoreObject(value) {
        return value !== null &&
            typeof value === "object" &&
            !isReference(value) &&
            !Array.isArray(value);
    }
    function makeProcessedFieldsMerger() {
        return new DeepMerger;
    }

    var DELETE = Object.create(null);
    var delModifier = function () { return DELETE; };
    var INVALIDATE = Object.create(null);
    var EntityStore = (function () {
        function EntityStore(policies, group) {
            var _this = this;
            this.policies = policies;
            this.group = group;
            this.data = Object.create(null);
            this.rootIds = Object.create(null);
            this.refs = Object.create(null);
            this.getFieldValue = function (objectOrReference, storeFieldName) { return maybeDeepFreeze(isReference(objectOrReference)
                ? _this.get(objectOrReference.__ref, storeFieldName)
                : objectOrReference && objectOrReference[storeFieldName]); };
            this.canRead = function (objOrRef) {
                return isReference(objOrRef)
                    ? _this.has(objOrRef.__ref)
                    : typeof objOrRef === "object";
            };
            this.toReference = function (objOrIdOrRef, mergeIntoStore) {
                if (typeof objOrIdOrRef === "string") {
                    return makeReference(objOrIdOrRef);
                }
                if (isReference(objOrIdOrRef)) {
                    return objOrIdOrRef;
                }
                var id = _this.policies.identify(objOrIdOrRef)[0];
                if (id) {
                    var ref = makeReference(id);
                    if (mergeIntoStore) {
                        _this.merge(id, objOrIdOrRef);
                    }
                    return ref;
                }
            };
        }
        EntityStore.prototype.toObject = function () {
            return __assign$2({}, this.data);
        };
        EntityStore.prototype.has = function (dataId) {
            return this.lookup(dataId, true) !== void 0;
        };
        EntityStore.prototype.get = function (dataId, fieldName) {
            this.group.depend(dataId, fieldName);
            if (hasOwn.call(this.data, dataId)) {
                var storeObject = this.data[dataId];
                if (storeObject && hasOwn.call(storeObject, fieldName)) {
                    return storeObject[fieldName];
                }
            }
            if (fieldName === "__typename" &&
                hasOwn.call(this.policies.rootTypenamesById, dataId)) {
                return this.policies.rootTypenamesById[dataId];
            }
            if (this instanceof Layer) {
                return this.parent.get(dataId, fieldName);
            }
        };
        EntityStore.prototype.lookup = function (dataId, dependOnExistence) {
            if (dependOnExistence)
                this.group.depend(dataId, "__exists");
            if (hasOwn.call(this.data, dataId)) {
                return this.data[dataId];
            }
            if (this instanceof Layer) {
                return this.parent.lookup(dataId, dependOnExistence);
            }
            if (this.policies.rootTypenamesById[dataId]) {
                return Object.create(null);
            }
        };
        EntityStore.prototype.merge = function (dataId, incoming) {
            var _this = this;
            var existing = this.lookup(dataId);
            var merged = new DeepMerger(storeObjectReconciler).merge(existing, incoming);
            this.data[dataId] = merged;
            if (merged !== existing) {
                delete this.refs[dataId];
                if (this.group.caching) {
                    var fieldsToDirty_1 = Object.create(null);
                    if (!existing)
                        fieldsToDirty_1.__exists = 1;
                    Object.keys(incoming).forEach(function (storeFieldName) {
                        if (!existing || existing[storeFieldName] !== merged[storeFieldName]) {
                            fieldsToDirty_1[storeFieldName] = 1;
                            var fieldName = fieldNameFromStoreName(storeFieldName);
                            if (fieldName !== storeFieldName &&
                                !_this.policies.hasKeyArgs(merged.__typename, fieldName)) {
                                fieldsToDirty_1[fieldName] = 1;
                            }
                            if (merged[storeFieldName] === void 0 && !(_this instanceof Layer)) {
                                delete merged[storeFieldName];
                            }
                        }
                    });
                    Object.keys(fieldsToDirty_1).forEach(function (fieldName) { return _this.group.dirty(dataId, fieldName); });
                }
            }
        };
        EntityStore.prototype.modify = function (dataId, fields) {
            var _this = this;
            var storeObject = this.lookup(dataId);
            if (storeObject) {
                var changedFields_1 = Object.create(null);
                var needToMerge_1 = false;
                var allDeleted_1 = true;
                var sharedDetails_1 = {
                    DELETE: DELETE,
                    INVALIDATE: INVALIDATE,
                    isReference: isReference,
                    toReference: this.toReference,
                    canRead: this.canRead,
                    readField: function (fieldNameOrOptions, from) { return _this.policies.readField(typeof fieldNameOrOptions === "string" ? {
                        fieldName: fieldNameOrOptions,
                        from: from || makeReference(dataId),
                    } : fieldNameOrOptions, { store: _this }); },
                };
                Object.keys(storeObject).forEach(function (storeFieldName) {
                    var fieldName = fieldNameFromStoreName(storeFieldName);
                    var fieldValue = storeObject[storeFieldName];
                    if (fieldValue === void 0)
                        return;
                    var modify = typeof fields === "function"
                        ? fields
                        : fields[storeFieldName] || fields[fieldName];
                    if (modify) {
                        var newValue = modify === delModifier ? DELETE :
                            modify(maybeDeepFreeze(fieldValue), __assign$2(__assign$2({}, sharedDetails_1), { fieldName: fieldName,
                                storeFieldName: storeFieldName, storage: _this.getStorage(dataId, storeFieldName) }));
                        if (newValue === INVALIDATE) {
                            _this.group.dirty(dataId, storeFieldName);
                        }
                        else {
                            if (newValue === DELETE)
                                newValue = void 0;
                            if (newValue !== fieldValue) {
                                changedFields_1[storeFieldName] = newValue;
                                needToMerge_1 = true;
                                fieldValue = newValue;
                            }
                        }
                    }
                    if (fieldValue !== void 0) {
                        allDeleted_1 = false;
                    }
                });
                if (needToMerge_1) {
                    this.merge(dataId, changedFields_1);
                    if (allDeleted_1) {
                        if (this instanceof Layer) {
                            this.data[dataId] = void 0;
                        }
                        else {
                            delete this.data[dataId];
                        }
                        this.group.dirty(dataId, "__exists");
                    }
                    return true;
                }
            }
            return false;
        };
        EntityStore.prototype.delete = function (dataId, fieldName, args) {
            var _a;
            var storeObject = this.lookup(dataId);
            if (storeObject) {
                var typename = this.getFieldValue(storeObject, "__typename");
                var storeFieldName = fieldName && args
                    ? this.policies.getStoreFieldName({ typename: typename, fieldName: fieldName, args: args })
                    : fieldName;
                return this.modify(dataId, storeFieldName ? (_a = {},
                    _a[storeFieldName] = delModifier,
                    _a) : delModifier);
            }
            return false;
        };
        EntityStore.prototype.evict = function (options) {
            var evicted = false;
            if (options.id) {
                if (hasOwn.call(this.data, options.id)) {
                    evicted = this.delete(options.id, options.fieldName, options.args);
                }
                if (this instanceof Layer) {
                    evicted = this.parent.evict(options) || evicted;
                }
                if (options.fieldName || evicted) {
                    this.group.dirty(options.id, options.fieldName || "__exists");
                }
            }
            return evicted;
        };
        EntityStore.prototype.clear = function () {
            this.replace(null);
        };
        EntityStore.prototype.extract = function () {
            var _this = this;
            var obj = this.toObject();
            var extraRootIds = [];
            this.getRootIdSet().forEach(function (id) {
                if (!hasOwn.call(_this.policies.rootTypenamesById, id)) {
                    extraRootIds.push(id);
                }
            });
            if (extraRootIds.length) {
                obj.__META = { extraRootIds: extraRootIds.sort() };
            }
            return obj;
        };
        EntityStore.prototype.replace = function (newData) {
            var _this = this;
            Object.keys(this.data).forEach(function (dataId) {
                if (!(newData && hasOwn.call(newData, dataId))) {
                    _this.delete(dataId);
                }
            });
            if (newData) {
                var __META = newData.__META, rest_1 = __rest(newData, ["__META"]);
                Object.keys(rest_1).forEach(function (dataId) {
                    _this.merge(dataId, rest_1[dataId]);
                });
                if (__META) {
                    __META.extraRootIds.forEach(this.retain, this);
                }
            }
        };
        EntityStore.prototype.retain = function (rootId) {
            return this.rootIds[rootId] = (this.rootIds[rootId] || 0) + 1;
        };
        EntityStore.prototype.release = function (rootId) {
            if (this.rootIds[rootId] > 0) {
                var count = --this.rootIds[rootId];
                if (!count)
                    delete this.rootIds[rootId];
                return count;
            }
            return 0;
        };
        EntityStore.prototype.getRootIdSet = function (ids) {
            if (ids === void 0) { ids = new Set(); }
            Object.keys(this.rootIds).forEach(ids.add, ids);
            if (this instanceof Layer) {
                this.parent.getRootIdSet(ids);
            }
            else {
                Object.keys(this.policies.rootTypenamesById).forEach(ids.add, ids);
            }
            return ids;
        };
        EntityStore.prototype.gc = function () {
            var _this = this;
            var ids = this.getRootIdSet();
            var snapshot = this.toObject();
            ids.forEach(function (id) {
                if (hasOwn.call(snapshot, id)) {
                    Object.keys(_this.findChildRefIds(id)).forEach(ids.add, ids);
                    delete snapshot[id];
                }
            });
            var idsToRemove = Object.keys(snapshot);
            if (idsToRemove.length) {
                var root_1 = this;
                while (root_1 instanceof Layer)
                    root_1 = root_1.parent;
                idsToRemove.forEach(function (id) { return root_1.delete(id); });
            }
            return idsToRemove;
        };
        EntityStore.prototype.findChildRefIds = function (dataId) {
            if (!hasOwn.call(this.refs, dataId)) {
                var found_1 = this.refs[dataId] = Object.create(null);
                var workSet_1 = new Set([this.data[dataId]]);
                var canTraverse_1 = function (obj) { return obj !== null && typeof obj === 'object'; };
                workSet_1.forEach(function (obj) {
                    if (isReference(obj)) {
                        found_1[obj.__ref] = true;
                    }
                    else if (canTraverse_1(obj)) {
                        Object.values(obj)
                            .filter(canTraverse_1)
                            .forEach(workSet_1.add, workSet_1);
                    }
                });
            }
            return this.refs[dataId];
        };
        EntityStore.prototype.makeCacheKey = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return this.group.keyMaker.lookupArray(args);
        };
        return EntityStore;
    }());
    var CacheGroup = (function () {
        function CacheGroup(caching) {
            this.caching = caching;
            this.d = null;
            this.keyMaker = new Trie(canUseWeakMap);
            this.d = caching ? dep() : null;
        }
        CacheGroup.prototype.depend = function (dataId, storeFieldName) {
            if (this.d) {
                this.d(makeDepKey(dataId, storeFieldName));
                var fieldName = fieldNameFromStoreName(storeFieldName);
                if (fieldName !== storeFieldName) {
                    this.d(makeDepKey(dataId, fieldName));
                }
            }
        };
        CacheGroup.prototype.dirty = function (dataId, storeFieldName) {
            if (this.d) {
                this.d.dirty(makeDepKey(dataId, storeFieldName));
            }
        };
        return CacheGroup;
    }());
    function makeDepKey(dataId, storeFieldName) {
        return storeFieldName + '#' + dataId;
    }
    (function (EntityStore) {
        var Root = (function (_super) {
            __extends$1(Root, _super);
            function Root(_a) {
                var policies = _a.policies, _b = _a.resultCaching, resultCaching = _b === void 0 ? true : _b, seed = _a.seed;
                var _this = _super.call(this, policies, new CacheGroup(resultCaching)) || this;
                _this.storageTrie = new Trie(canUseWeakMap);
                _this.sharedLayerGroup = new CacheGroup(resultCaching);
                if (seed)
                    _this.replace(seed);
                return _this;
            }
            Root.prototype.addLayer = function (layerId, replay) {
                return new Layer(layerId, this, replay, this.sharedLayerGroup);
            };
            Root.prototype.removeLayer = function () {
                return this;
            };
            Root.prototype.getStorage = function () {
                return this.storageTrie.lookupArray(arguments);
            };
            return Root;
        }(EntityStore));
        EntityStore.Root = Root;
    })(EntityStore || (EntityStore = {}));
    var Layer = (function (_super) {
        __extends$1(Layer, _super);
        function Layer(id, parent, replay, group) {
            var _this = _super.call(this, parent.policies, group) || this;
            _this.id = id;
            _this.parent = parent;
            _this.replay = replay;
            _this.group = group;
            replay(_this);
            return _this;
        }
        Layer.prototype.addLayer = function (layerId, replay) {
            return new Layer(layerId, this, replay, this.group);
        };
        Layer.prototype.removeLayer = function (layerId) {
            var _this = this;
            var parent = this.parent.removeLayer(layerId);
            if (layerId === this.id) {
                if (this.group.caching) {
                    Object.keys(this.data).forEach(function (dataId) {
                        if (_this.data[dataId] !== parent.lookup(dataId)) {
                            _this.delete(dataId);
                        }
                    });
                }
                return parent;
            }
            if (parent === this.parent)
                return this;
            return parent.addLayer(this.id, this.replay);
        };
        Layer.prototype.toObject = function () {
            return __assign$2(__assign$2({}, this.parent.toObject()), this.data);
        };
        Layer.prototype.findChildRefIds = function (dataId) {
            var fromParent = this.parent.findChildRefIds(dataId);
            return hasOwn.call(this.data, dataId) ? __assign$2(__assign$2({}, fromParent), _super.prototype.findChildRefIds.call(this, dataId)) : fromParent;
        };
        Layer.prototype.getStorage = function () {
            var p = this.parent;
            while (p.parent)
                p = p.parent;
            return p.getStorage.apply(p, arguments);
        };
        return Layer;
    }(EntityStore));
    function storeObjectReconciler(existingObject, incomingObject, property) {
        var existingValue = existingObject[property];
        var incomingValue = incomingObject[property];
        return equal(existingValue, incomingValue) ? existingValue : incomingValue;
    }
    function supportsResultCaching(store) {
        return !!(store instanceof EntityStore && store.group.caching);
    }

    function missingFromInvariant(err, context) {
        return new MissingFieldError(err.message, context.path.slice(), context.query, context.clientOnly, context.variables);
    }
    var StoreReader = (function () {
        function StoreReader(config) {
            var _this = this;
            this.config = config;
            this.executeSelectionSet = wrap(function (options) { return _this.execSelectionSetImpl(options); }, {
                keyArgs: function (options) {
                    return [
                        options.selectionSet,
                        options.objectOrReference,
                        options.context,
                    ];
                },
                makeCacheKey: function (selectionSet, parent, context) {
                    if (supportsResultCaching(context.store)) {
                        return context.store.makeCacheKey(selectionSet, isReference(parent) ? parent.__ref : parent, context.varString);
                    }
                }
            });
            this.knownResults = new WeakMap();
            this.executeSubSelectedArray = wrap(function (options) {
                return _this.execSubSelectedArrayImpl(options);
            }, {
                makeCacheKey: function (_a) {
                    var field = _a.field, array = _a.array, context = _a.context;
                    if (supportsResultCaching(context.store)) {
                        return context.store.makeCacheKey(field, array, context.varString);
                    }
                }
            });
            this.config = __assign$2({ addTypename: true }, config);
        }
        StoreReader.prototype.diffQueryAgainstStore = function (_a) {
            var store = _a.store, query = _a.query, _b = _a.rootId, rootId = _b === void 0 ? 'ROOT_QUERY' : _b, variables = _a.variables, _c = _a.returnPartialData, returnPartialData = _c === void 0 ? true : _c;
            var policies = this.config.cache.policies;
            variables = __assign$2(__assign$2({}, getDefaultValues(getQueryDefinition(query))), variables);
            var execResult = this.executeSelectionSet({
                selectionSet: getMainDefinition(query).selectionSet,
                objectOrReference: makeReference(rootId),
                context: {
                    store: store,
                    query: query,
                    policies: policies,
                    variables: variables,
                    varString: JSON.stringify(variables),
                    fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
                    path: [],
                    clientOnly: false,
                },
            });
            var hasMissingFields = execResult.missing && execResult.missing.length > 0;
            if (hasMissingFields && !returnPartialData) {
                throw execResult.missing[0];
            }
            return {
                result: execResult.result,
                missing: execResult.missing,
                complete: !hasMissingFields,
            };
        };
        StoreReader.prototype.isFresh = function (result, parent, selectionSet, context) {
            if (supportsResultCaching(context.store) &&
                this.knownResults.get(result) === selectionSet) {
                var latest = this.executeSelectionSet.peek(selectionSet, parent, context);
                if (latest && result === latest.result) {
                    return true;
                }
            }
            return false;
        };
        StoreReader.prototype.execSelectionSetImpl = function (_a) {
            var _this = this;
            var selectionSet = _a.selectionSet, objectOrReference = _a.objectOrReference, context = _a.context;
            if (isReference(objectOrReference) &&
                !context.policies.rootTypenamesById[objectOrReference.__ref] &&
                !context.store.has(objectOrReference.__ref)) {
                return {
                    result: {},
                    missing: [missingFromInvariant(process.env.NODE_ENV === "production" ? new InvariantError(4) : new InvariantError("Dangling reference to missing " + objectOrReference.__ref + " object"), context)],
                };
            }
            var variables = context.variables, policies = context.policies, store = context.store;
            var objectsToMerge = [];
            var finalResult = { result: null };
            var typename = store.getFieldValue(objectOrReference, "__typename");
            if (this.config.addTypename &&
                typeof typename === "string" &&
                !policies.rootIdsByTypename[typename]) {
                objectsToMerge.push({ __typename: typename });
            }
            function getMissing() {
                return finalResult.missing || (finalResult.missing = []);
            }
            function handleMissing(result) {
                var _a;
                if (result.missing)
                    (_a = getMissing()).push.apply(_a, result.missing);
                return result.result;
            }
            var workSet = new Set(selectionSet.selections);
            workSet.forEach(function (selection) {
                var _a;
                if (!shouldInclude(selection, variables))
                    return;
                if (isField(selection)) {
                    var fieldValue = policies.readField({
                        fieldName: selection.name.value,
                        field: selection,
                        variables: context.variables,
                        from: objectOrReference,
                    }, context);
                    var resultName = resultKeyNameFromField(selection);
                    context.path.push(resultName);
                    var wasClientOnly = context.clientOnly;
                    context.clientOnly = wasClientOnly || !!(selection.directives &&
                        selection.directives.some(function (d) { return d.name.value === "client"; }));
                    if (fieldValue === void 0) {
                        if (!addTypenameToDocument.added(selection)) {
                            getMissing().push(missingFromInvariant(process.env.NODE_ENV === "production" ? new InvariantError(5) : new InvariantError("Can't find field '" + selection.name.value + "' on " + (isReference(objectOrReference)
                                ? objectOrReference.__ref + " object"
                                : "object " + JSON.stringify(objectOrReference, null, 2))), context));
                        }
                    }
                    else if (Array.isArray(fieldValue)) {
                        fieldValue = handleMissing(_this.executeSubSelectedArray({
                            field: selection,
                            array: fieldValue,
                            context: context,
                        }));
                    }
                    else if (!selection.selectionSet) {
                        if (process.env.NODE_ENV !== 'production') {
                            assertSelectionSetForIdValue(context.store, selection, fieldValue);
                            maybeDeepFreeze(fieldValue);
                        }
                    }
                    else if (fieldValue != null) {
                        fieldValue = handleMissing(_this.executeSelectionSet({
                            selectionSet: selection.selectionSet,
                            objectOrReference: fieldValue,
                            context: context,
                        }));
                    }
                    if (fieldValue !== void 0) {
                        objectsToMerge.push((_a = {}, _a[resultName] = fieldValue, _a));
                    }
                    context.clientOnly = wasClientOnly;
                    invariant(context.path.pop() === resultName);
                }
                else {
                    var fragment = getFragmentFromSelection(selection, context.fragmentMap);
                    if (fragment && policies.fragmentMatches(fragment, typename)) {
                        fragment.selectionSet.selections.forEach(workSet.add, workSet);
                    }
                }
            });
            finalResult.result = mergeDeepArray(objectsToMerge);
            if (process.env.NODE_ENV !== 'production') {
                Object.freeze(finalResult.result);
            }
            this.knownResults.set(finalResult.result, selectionSet);
            return finalResult;
        };
        StoreReader.prototype.execSubSelectedArrayImpl = function (_a) {
            var _this = this;
            var field = _a.field, array = _a.array, context = _a.context;
            var missing;
            function handleMissing(childResult, i) {
                if (childResult.missing) {
                    missing = missing || [];
                    missing.push.apply(missing, childResult.missing);
                }
                invariant(context.path.pop() === i);
                return childResult.result;
            }
            if (field.selectionSet) {
                array = array.filter(context.store.canRead);
            }
            array = array.map(function (item, i) {
                if (item === null) {
                    return null;
                }
                context.path.push(i);
                if (Array.isArray(item)) {
                    return handleMissing(_this.executeSubSelectedArray({
                        field: field,
                        array: item,
                        context: context,
                    }), i);
                }
                if (field.selectionSet) {
                    return handleMissing(_this.executeSelectionSet({
                        selectionSet: field.selectionSet,
                        objectOrReference: item,
                        context: context,
                    }), i);
                }
                if (process.env.NODE_ENV !== 'production') {
                    assertSelectionSetForIdValue(context.store, field, item);
                }
                invariant(context.path.pop() === i);
                return item;
            });
            if (process.env.NODE_ENV !== 'production') {
                Object.freeze(array);
            }
            return { result: array, missing: missing };
        };
        return StoreReader;
    }());
    function assertSelectionSetForIdValue(store, field, fieldValue) {
        if (!field.selectionSet) {
            var workSet_1 = new Set([fieldValue]);
            workSet_1.forEach(function (value) {
                if (value && typeof value === "object") {
                    process.env.NODE_ENV === "production" ? invariant(!isReference(value), 6) : invariant(!isReference(value), "Missing selection set for object of type " + getTypenameFromStoreObject(store, value) + " returned for query field " + field.name.value);
                    Object.values(value).forEach(workSet_1.add, workSet_1);
                }
            });
        }
    }

    var StoreWriter = (function () {
        function StoreWriter(cache, reader) {
            this.cache = cache;
            this.reader = reader;
        }
        StoreWriter.prototype.writeToStore = function (_a) {
            var query = _a.query, result = _a.result, dataId = _a.dataId, store = _a.store, variables = _a.variables;
            var operationDefinition = getOperationDefinition(query);
            var merger = makeProcessedFieldsMerger();
            variables = __assign$2(__assign$2({}, getDefaultValues(operationDefinition)), variables);
            var ref = this.processSelectionSet({
                result: result || Object.create(null),
                dataId: dataId,
                selectionSet: operationDefinition.selectionSet,
                mergeTree: { map: new Map },
                context: {
                    store: store,
                    written: Object.create(null),
                    merge: function (existing, incoming) {
                        return merger.merge(existing, incoming);
                    },
                    variables: variables,
                    varString: JSON.stringify(variables),
                    fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
                },
            });
            if (!isReference(ref)) {
                throw process.env.NODE_ENV === "production" ? new InvariantError(7) : new InvariantError("Could not identify object " + JSON.stringify(result));
            }
            store.retain(ref.__ref);
            return ref;
        };
        StoreWriter.prototype.processSelectionSet = function (_a) {
            var _this = this;
            var dataId = _a.dataId, result = _a.result, selectionSet = _a.selectionSet, context = _a.context, mergeTree = _a.mergeTree;
            var policies = this.cache.policies;
            var _b = policies.identify(result, selectionSet, context.fragmentMap), id = _b[0], keyObject = _b[1];
            dataId = dataId || id;
            if ("string" === typeof dataId) {
                var sets = context.written[dataId] || (context.written[dataId] = []);
                var ref = makeReference(dataId);
                if (sets.indexOf(selectionSet) >= 0)
                    return ref;
                sets.push(selectionSet);
                if (this.reader && this.reader.isFresh(result, ref, selectionSet, context)) {
                    return ref;
                }
            }
            var incomingFields = Object.create(null);
            if (keyObject) {
                incomingFields = context.merge(incomingFields, keyObject);
            }
            var typename = (dataId && policies.rootTypenamesById[dataId]) ||
                getTypenameFromResult(result, selectionSet, context.fragmentMap) ||
                (dataId && context.store.get(dataId, "__typename"));
            if ("string" === typeof typename) {
                incomingFields.__typename = typename;
            }
            var workSet = new Set(selectionSet.selections);
            workSet.forEach(function (selection) {
                var _a;
                if (!shouldInclude(selection, context.variables))
                    return;
                if (isField(selection)) {
                    var resultFieldKey = resultKeyNameFromField(selection);
                    var value = result[resultFieldKey];
                    if (typeof value !== 'undefined') {
                        var storeFieldName = policies.getStoreFieldName({
                            typename: typename,
                            fieldName: selection.name.value,
                            field: selection,
                            variables: context.variables,
                        });
                        var childTree = getChildMergeTree(mergeTree, storeFieldName);
                        var incomingValue = _this.processFieldValue(value, selection, context, childTree);
                        var childTypename = selection.selectionSet
                            && context.store.getFieldValue(incomingValue, "__typename")
                            || void 0;
                        var merge = policies.getMergeFunction(typename, selection.name.value, childTypename);
                        if (merge) {
                            childTree.info = {
                                field: selection,
                                typename: typename,
                                merge: merge,
                            };
                        }
                        else {
                            maybeRecycleChildMergeTree(mergeTree, storeFieldName);
                        }
                        incomingFields = context.merge(incomingFields, (_a = {},
                            _a[storeFieldName] = incomingValue,
                            _a));
                    }
                    else if (policies.usingPossibleTypes &&
                        !hasDirectives(["defer", "client"], selection)) {
                        throw process.env.NODE_ENV === "production" ? new InvariantError(8) : new InvariantError("Missing field '" + resultFieldKey + "' in " + JSON.stringify(result, null, 2).substring(0, 100));
                    }
                }
                else {
                    var fragment = getFragmentFromSelection(selection, context.fragmentMap);
                    if (fragment &&
                        policies.fragmentMatches(fragment, typename, result, context.variables)) {
                        fragment.selectionSet.selections.forEach(workSet.add, workSet);
                    }
                }
            });
            if ("string" === typeof dataId) {
                var entityRef_1 = makeReference(dataId);
                if (mergeTree.map.size) {
                    incomingFields = this.applyMerges(mergeTree, entityRef_1, incomingFields, context);
                }
                if (process.env.NODE_ENV !== "production") {
                    var hasSelectionSet_1 = function (storeFieldName) {
                        return fieldsWithSelectionSets_1.has(fieldNameFromStoreName(storeFieldName));
                    };
                    var fieldsWithSelectionSets_1 = new Set();
                    workSet.forEach(function (selection) {
                        if (isField(selection) && selection.selectionSet) {
                            fieldsWithSelectionSets_1.add(selection.name.value);
                        }
                    });
                    var hasMergeFunction_1 = function (storeFieldName) {
                        var childTree = mergeTree.map.get(storeFieldName);
                        return Boolean(childTree && childTree.info && childTree.info.merge);
                    };
                    Object.keys(incomingFields).forEach(function (storeFieldName) {
                        if (hasSelectionSet_1(storeFieldName) &&
                            !hasMergeFunction_1(storeFieldName)) {
                            warnAboutDataLoss(entityRef_1, incomingFields, storeFieldName, context.store);
                        }
                    });
                }
                context.store.merge(dataId, incomingFields);
                return entityRef_1;
            }
            return incomingFields;
        };
        StoreWriter.prototype.processFieldValue = function (value, field, context, mergeTree) {
            var _this = this;
            if (!field.selectionSet || value === null) {
                return process.env.NODE_ENV === 'production' ? value : cloneDeep(value);
            }
            if (Array.isArray(value)) {
                return value.map(function (item, i) {
                    var value = _this.processFieldValue(item, field, context, getChildMergeTree(mergeTree, i));
                    maybeRecycleChildMergeTree(mergeTree, i);
                    return value;
                });
            }
            return this.processSelectionSet({
                result: value,
                selectionSet: field.selectionSet,
                context: context,
                mergeTree: mergeTree,
            });
        };
        StoreWriter.prototype.applyMerges = function (mergeTree, existing, incoming, context, getStorageArgs) {
            var _a;
            var _this = this;
            if (mergeTree.map.size && !isReference(incoming)) {
                var e_1 = (!Array.isArray(incoming) &&
                    (isReference(existing) || storeValueIsStoreObject(existing))) ? existing : void 0;
                var i_1 = incoming;
                if (e_1 && !getStorageArgs) {
                    getStorageArgs = [isReference(e_1) ? e_1.__ref : e_1];
                }
                var changedFields_1;
                var getValue_1 = function (from, name) {
                    return Array.isArray(from)
                        ? (typeof name === "number" ? from[name] : void 0)
                        : context.store.getFieldValue(from, String(name));
                };
                mergeTree.map.forEach(function (childTree, storeFieldName) {
                    if (getStorageArgs) {
                        getStorageArgs.push(storeFieldName);
                    }
                    var eVal = getValue_1(e_1, storeFieldName);
                    var iVal = getValue_1(i_1, storeFieldName);
                    var aVal = _this.applyMerges(childTree, eVal, iVal, context, getStorageArgs);
                    if (aVal !== iVal) {
                        changedFields_1 = changedFields_1 || new Map;
                        changedFields_1.set(storeFieldName, aVal);
                    }
                    if (getStorageArgs) {
                        invariant(getStorageArgs.pop() === storeFieldName);
                    }
                });
                if (changedFields_1) {
                    incoming = (Array.isArray(i_1) ? i_1.slice(0) : __assign$2({}, i_1));
                    changedFields_1.forEach(function (value, name) {
                        incoming[name] = value;
                    });
                }
            }
            if (mergeTree.info) {
                return this.cache.policies.runMergeFunction(existing, incoming, mergeTree.info, context, getStorageArgs && (_a = context.store).getStorage.apply(_a, getStorageArgs));
            }
            return incoming;
        };
        return StoreWriter;
    }());
    var emptyMergeTreePool = [];
    function getChildMergeTree(_a, name) {
        var map = _a.map;
        if (!map.has(name)) {
            map.set(name, emptyMergeTreePool.pop() || { map: new Map });
        }
        return map.get(name);
    }
    function maybeRecycleChildMergeTree(_a, name) {
        var map = _a.map;
        var childTree = map.get(name);
        if (childTree &&
            !childTree.info &&
            !childTree.map.size) {
            emptyMergeTreePool.push(childTree);
            map.delete(name);
        }
    }
    var warnings = new Set();
    function warnAboutDataLoss(existingRef, incomingObj, storeFieldName, store) {
        var getChild = function (objOrRef) {
            var child = store.getFieldValue(objOrRef, storeFieldName);
            return typeof child === "object" && child;
        };
        var existing = getChild(existingRef);
        if (!existing)
            return;
        var incoming = getChild(incomingObj);
        if (!incoming)
            return;
        if (isReference(existing))
            return;
        if (equal(existing, incoming))
            return;
        if (Object.keys(existing).every(function (key) { return store.getFieldValue(incoming, key) !== void 0; })) {
            return;
        }
        var parentType = store.getFieldValue(existingRef, "__typename") ||
            store.getFieldValue(incomingObj, "__typename");
        var fieldName = fieldNameFromStoreName(storeFieldName);
        var typeDotName = parentType + "." + fieldName;
        if (warnings.has(typeDotName))
            return;
        warnings.add(typeDotName);
        var childTypenames = [];
        if (!Array.isArray(existing) &&
            !Array.isArray(incoming)) {
            [existing, incoming].forEach(function (child) {
                var typename = store.getFieldValue(child, "__typename");
                if (typeof typename === "string" &&
                    !childTypenames.includes(typename)) {
                    childTypenames.push(typename);
                }
            });
        }
        process.env.NODE_ENV === "production" || invariant.warn("Cache data may be lost when replacing the " + fieldName + " field of a " + parentType + " object.\n\nTo address this problem (which is not a bug in Apollo Client), " + (childTypenames.length
            ? "either ensure all objects of type " +
                childTypenames.join(" and ") + " have an ID or a custom merge function, or "
            : "") + "define a custom merge function for the " + typeDotName + " field, so InMemoryCache can safely merge these objects:\n\n  existing: " + JSON.stringify(existing).slice(0, 1000) + "\n  incoming: " + JSON.stringify(incoming).slice(0, 1000) + "\n\nFor more information about these options, please refer to the documentation:\n\n  * Ensuring entity objects have IDs: https://go.apollo.dev/c/generating-unique-identifiers\n  * Defining custom merge functions: https://go.apollo.dev/c/merging-non-normalized-objects\n");
    }

    var cacheSlot = new Slot();
    function consumeAndIterate(set, callback) {
        if (set.size) {
            var items_1 = [];
            set.forEach(function (item) { return items_1.push(item); });
            set.clear();
            items_1.forEach(callback);
        }
    }
    var cacheInfoMap = new WeakMap();
    function getCacheInfo(cache) {
        var info = cacheInfoMap.get(cache);
        if (!info) {
            cacheInfoMap.set(cache, info = {
                vars: new Set,
                dep: dep(),
            });
        }
        return info;
    }
    function forgetCache(cache) {
        getCacheInfo(cache).vars.forEach(function (rv) { return rv.forgetCache(cache); });
    }
    function recallCache(cache) {
        getCacheInfo(cache).vars.forEach(function (rv) { return rv.attachCache(cache); });
    }
    function makeVar(value) {
        var caches = new Set();
        var listeners = new Set();
        var rv = function (newValue) {
            if (arguments.length > 0) {
                if (value !== newValue) {
                    value = newValue;
                    caches.forEach(function (cache) {
                        getCacheInfo(cache).dep.dirty(rv);
                        broadcast(cache);
                    });
                    consumeAndIterate(listeners, function (listener) { return listener(value); });
                }
            }
            else {
                var cache = cacheSlot.getValue();
                if (cache) {
                    attach(cache);
                    getCacheInfo(cache).dep(rv);
                }
            }
            return value;
        };
        rv.onNextChange = function (listener) {
            listeners.add(listener);
            return function () {
                listeners.delete(listener);
            };
        };
        var attach = rv.attachCache = function (cache) {
            caches.add(cache);
            getCacheInfo(cache).vars.add(rv);
            return rv;
        };
        rv.forgetCache = function (cache) { return caches.delete(cache); };
        return rv;
    }
    function broadcast(cache) {
        if (cache.broadcastWatches) {
            cache.broadcastWatches();
        }
    }

    function argsFromFieldSpecifier(spec) {
        return spec.args !== void 0 ? spec.args :
            spec.field ? argumentsObjectFromField(spec.field, spec.variables) : null;
    }
    var defaultDataIdFromObject = function (_a, context) {
        var __typename = _a.__typename, id = _a.id, _id = _a._id;
        if (typeof __typename === "string") {
            if (context) {
                context.keyObject =
                    id !== void 0 ? { id: id } :
                        _id !== void 0 ? { _id: _id } :
                            void 0;
            }
            if (id === void 0)
                id = _id;
            if (id !== void 0) {
                return __typename + ":" + ((typeof id === "number" ||
                    typeof id === "string") ? id : JSON.stringify(id));
            }
        }
    };
    var nullKeyFieldsFn = function () { return void 0; };
    var simpleKeyArgsFn = function (_args, context) { return context.fieldName; };
    var mergeTrueFn = function (existing, incoming, _a) {
        var mergeObjects = _a.mergeObjects;
        return mergeObjects(existing, incoming);
    };
    var mergeFalseFn = function (_, incoming) { return incoming; };
    var Policies = (function () {
        function Policies(config) {
            this.config = config;
            this.typePolicies = Object.create(null);
            this.toBeAdded = Object.create(null);
            this.supertypeMap = new Map();
            this.fuzzySubtypes = new Map();
            this.rootIdsByTypename = Object.create(null);
            this.rootTypenamesById = Object.create(null);
            this.usingPossibleTypes = false;
            this.config = __assign$2({ dataIdFromObject: defaultDataIdFromObject }, config);
            this.cache = this.config.cache;
            this.setRootTypename("Query");
            this.setRootTypename("Mutation");
            this.setRootTypename("Subscription");
            if (config.possibleTypes) {
                this.addPossibleTypes(config.possibleTypes);
            }
            if (config.typePolicies) {
                this.addTypePolicies(config.typePolicies);
            }
        }
        Policies.prototype.identify = function (object, selectionSet, fragmentMap) {
            var typename = selectionSet && fragmentMap
                ? getTypenameFromResult(object, selectionSet, fragmentMap)
                : object.__typename;
            if (typename === this.rootTypenamesById.ROOT_QUERY) {
                return ["ROOT_QUERY"];
            }
            var context = {
                typename: typename,
                selectionSet: selectionSet,
                fragmentMap: fragmentMap,
            };
            var id;
            var policy = typename && this.getTypePolicy(typename);
            var keyFn = policy && policy.keyFn || this.config.dataIdFromObject;
            while (keyFn) {
                var specifierOrId = keyFn(object, context);
                if (Array.isArray(specifierOrId)) {
                    keyFn = keyFieldsFnFromSpecifier(specifierOrId);
                }
                else {
                    id = specifierOrId;
                    break;
                }
            }
            id = id ? String(id) : void 0;
            return context.keyObject ? [id, context.keyObject] : [id];
        };
        Policies.prototype.addTypePolicies = function (typePolicies) {
            var _this = this;
            Object.keys(typePolicies).forEach(function (typename) {
                var _a = typePolicies[typename], queryType = _a.queryType, mutationType = _a.mutationType, subscriptionType = _a.subscriptionType, incoming = __rest(_a, ["queryType", "mutationType", "subscriptionType"]);
                if (queryType)
                    _this.setRootTypename("Query", typename);
                if (mutationType)
                    _this.setRootTypename("Mutation", typename);
                if (subscriptionType)
                    _this.setRootTypename("Subscription", typename);
                if (hasOwn.call(_this.toBeAdded, typename)) {
                    _this.toBeAdded[typename].push(incoming);
                }
                else {
                    _this.toBeAdded[typename] = [incoming];
                }
            });
        };
        Policies.prototype.updateTypePolicy = function (typename, incoming) {
            var _this = this;
            var existing = this.getTypePolicy(typename);
            var keyFields = incoming.keyFields, fields = incoming.fields;
            function setMerge(existing, merge) {
                existing.merge =
                    typeof merge === "function" ? merge :
                        merge === true ? mergeTrueFn :
                            merge === false ? mergeFalseFn :
                                existing.merge;
            }
            setMerge(existing, incoming.merge);
            existing.keyFn =
                keyFields === false ? nullKeyFieldsFn :
                    Array.isArray(keyFields) ? keyFieldsFnFromSpecifier(keyFields) :
                        typeof keyFields === "function" ? keyFields :
                            existing.keyFn;
            if (fields) {
                Object.keys(fields).forEach(function (fieldName) {
                    var existing = _this.getFieldPolicy(typename, fieldName, true);
                    var incoming = fields[fieldName];
                    if (typeof incoming === "function") {
                        existing.read = incoming;
                    }
                    else {
                        var keyArgs = incoming.keyArgs, read = incoming.read, merge = incoming.merge;
                        existing.keyFn =
                            keyArgs === false ? simpleKeyArgsFn :
                                Array.isArray(keyArgs) ? keyArgsFnFromSpecifier(keyArgs) :
                                    typeof keyArgs === "function" ? keyArgs :
                                        existing.keyFn;
                        if (typeof read === "function") {
                            existing.read = read;
                        }
                        setMerge(existing, merge);
                    }
                    if (existing.read && existing.merge) {
                        existing.keyFn = existing.keyFn || simpleKeyArgsFn;
                    }
                });
            }
        };
        Policies.prototype.setRootTypename = function (which, typename) {
            if (typename === void 0) { typename = which; }
            var rootId = "ROOT_" + which.toUpperCase();
            var old = this.rootTypenamesById[rootId];
            if (typename !== old) {
                process.env.NODE_ENV === "production" ? invariant(!old || old === which, 1) : invariant(!old || old === which, "Cannot change root " + which + " __typename more than once");
                if (old)
                    delete this.rootIdsByTypename[old];
                this.rootIdsByTypename[typename] = rootId;
                this.rootTypenamesById[rootId] = typename;
            }
        };
        Policies.prototype.addPossibleTypes = function (possibleTypes) {
            var _this = this;
            this.usingPossibleTypes = true;
            Object.keys(possibleTypes).forEach(function (supertype) {
                _this.getSupertypeSet(supertype, true);
                possibleTypes[supertype].forEach(function (subtype) {
                    _this.getSupertypeSet(subtype, true).add(supertype);
                    var match = subtype.match(TypeOrFieldNameRegExp);
                    if (!match || match[0] !== subtype) {
                        _this.fuzzySubtypes.set(subtype, new RegExp(subtype));
                    }
                });
            });
        };
        Policies.prototype.getTypePolicy = function (typename) {
            var _this = this;
            if (!hasOwn.call(this.typePolicies, typename)) {
                var policy_1 = this.typePolicies[typename] = Object.create(null);
                policy_1.fields = Object.create(null);
                var supertypes = this.supertypeMap.get(typename);
                if (supertypes && supertypes.size) {
                    supertypes.forEach(function (supertype) {
                        var _a = _this.getTypePolicy(supertype), fields = _a.fields, rest = __rest(_a, ["fields"]);
                        Object.assign(policy_1, rest);
                        Object.assign(policy_1.fields, fields);
                    });
                }
            }
            var inbox = this.toBeAdded[typename];
            if (inbox && inbox.length) {
                this.updateTypePolicy(typename, compact.apply(void 0, inbox.splice(0)));
            }
            return this.typePolicies[typename];
        };
        Policies.prototype.getFieldPolicy = function (typename, fieldName, createIfMissing) {
            if (typename) {
                var fieldPolicies = this.getTypePolicy(typename).fields;
                return fieldPolicies[fieldName] || (createIfMissing && (fieldPolicies[fieldName] = Object.create(null)));
            }
        };
        Policies.prototype.getSupertypeSet = function (subtype, createIfMissing) {
            var supertypeSet = this.supertypeMap.get(subtype);
            if (!supertypeSet && createIfMissing) {
                this.supertypeMap.set(subtype, supertypeSet = new Set());
            }
            return supertypeSet;
        };
        Policies.prototype.fragmentMatches = function (fragment, typename, result, variables) {
            var _this = this;
            if (!fragment.typeCondition)
                return true;
            if (!typename)
                return false;
            var supertype = fragment.typeCondition.name.value;
            if (typename === supertype)
                return true;
            if (this.usingPossibleTypes &&
                this.supertypeMap.has(supertype)) {
                var typenameSupertypeSet = this.getSupertypeSet(typename, true);
                var workQueue_1 = [typenameSupertypeSet];
                var maybeEnqueue_1 = function (subtype) {
                    var supertypeSet = _this.getSupertypeSet(subtype, false);
                    if (supertypeSet &&
                        supertypeSet.size &&
                        workQueue_1.indexOf(supertypeSet) < 0) {
                        workQueue_1.push(supertypeSet);
                    }
                };
                var needToCheckFuzzySubtypes = !!(result && this.fuzzySubtypes.size);
                var checkingFuzzySubtypes = false;
                for (var i = 0; i < workQueue_1.length; ++i) {
                    var supertypeSet = workQueue_1[i];
                    if (supertypeSet.has(supertype)) {
                        if (!typenameSupertypeSet.has(supertype)) {
                            if (checkingFuzzySubtypes) {
                                process.env.NODE_ENV === "production" || invariant.warn("Inferring subtype " + typename + " of supertype " + supertype);
                            }
                            typenameSupertypeSet.add(supertype);
                        }
                        return true;
                    }
                    supertypeSet.forEach(maybeEnqueue_1);
                    if (needToCheckFuzzySubtypes &&
                        i === workQueue_1.length - 1 &&
                        selectionSetMatchesResult(fragment.selectionSet, result, variables)) {
                        needToCheckFuzzySubtypes = false;
                        checkingFuzzySubtypes = true;
                        this.fuzzySubtypes.forEach(function (regExp, fuzzyString) {
                            var match = typename.match(regExp);
                            if (match && match[0] === typename) {
                                maybeEnqueue_1(fuzzyString);
                            }
                        });
                    }
                }
            }
            return false;
        };
        Policies.prototype.hasKeyArgs = function (typename, fieldName) {
            var policy = this.getFieldPolicy(typename, fieldName, false);
            return !!(policy && policy.keyFn);
        };
        Policies.prototype.getStoreFieldName = function (fieldSpec) {
            var typename = fieldSpec.typename, fieldName = fieldSpec.fieldName;
            var policy = this.getFieldPolicy(typename, fieldName, false);
            var storeFieldName;
            var keyFn = policy && policy.keyFn;
            if (keyFn && typename) {
                var context = {
                    typename: typename,
                    fieldName: fieldName,
                    field: fieldSpec.field || null,
                    variables: fieldSpec.variables,
                };
                var args = argsFromFieldSpecifier(fieldSpec);
                while (keyFn) {
                    var specifierOrString = keyFn(args, context);
                    if (Array.isArray(specifierOrString)) {
                        keyFn = keyArgsFnFromSpecifier(specifierOrString);
                    }
                    else {
                        storeFieldName = specifierOrString || fieldName;
                        break;
                    }
                }
            }
            if (storeFieldName === void 0) {
                storeFieldName = fieldSpec.field
                    ? storeKeyNameFromField(fieldSpec.field, fieldSpec.variables)
                    : getStoreKeyName(fieldName, argsFromFieldSpecifier(fieldSpec));
            }
            if (storeFieldName === false) {
                return fieldName;
            }
            return fieldName === fieldNameFromStoreName(storeFieldName)
                ? storeFieldName
                : fieldName + ":" + storeFieldName;
        };
        Policies.prototype.readField = function (options, context) {
            var objectOrReference = options.from;
            if (!objectOrReference)
                return;
            var nameOrField = options.field || options.fieldName;
            if (!nameOrField)
                return;
            if (options.typename === void 0) {
                var typename = context.store.getFieldValue(objectOrReference, "__typename");
                if (typename)
                    options.typename = typename;
            }
            var storeFieldName = this.getStoreFieldName(options);
            var fieldName = fieldNameFromStoreName(storeFieldName);
            var existing = context.store.getFieldValue(objectOrReference, storeFieldName);
            var policy = this.getFieldPolicy(options.typename, fieldName, false);
            var read = policy && policy.read;
            if (read) {
                var readOptions = makeFieldFunctionOptions(this, objectOrReference, options, context, context.store.getStorage(isReference(objectOrReference)
                    ? objectOrReference.__ref
                    : objectOrReference, storeFieldName));
                return cacheSlot.withValue(this.cache, read, [existing, readOptions]);
            }
            return existing;
        };
        Policies.prototype.getMergeFunction = function (parentTypename, fieldName, childTypename) {
            var policy = this.getFieldPolicy(parentTypename, fieldName, false);
            var merge = policy && policy.merge;
            if (!merge && childTypename) {
                policy = this.getTypePolicy(childTypename);
                merge = policy && policy.merge;
            }
            return merge;
        };
        Policies.prototype.runMergeFunction = function (existing, incoming, _a, context, storage) {
            var field = _a.field, typename = _a.typename, merge = _a.merge;
            if (merge === mergeTrueFn) {
                return makeMergeObjectsFunction(context.store.getFieldValue)(existing, incoming);
            }
            if (merge === mergeFalseFn) {
                return incoming;
            }
            return merge(existing, incoming, makeFieldFunctionOptions(this, void 0, { typename: typename, fieldName: field.name.value, field: field, variables: context.variables }, context, storage || Object.create(null)));
        };
        return Policies;
    }());
    function makeFieldFunctionOptions(policies, objectOrReference, fieldSpec, context, storage) {
        var storeFieldName = policies.getStoreFieldName(fieldSpec);
        var fieldName = fieldNameFromStoreName(storeFieldName);
        var variables = fieldSpec.variables || context.variables;
        var _a = context.store, getFieldValue = _a.getFieldValue, toReference = _a.toReference, canRead = _a.canRead;
        return {
            args: argsFromFieldSpecifier(fieldSpec),
            field: fieldSpec.field || null,
            fieldName: fieldName,
            storeFieldName: storeFieldName,
            variables: variables,
            isReference: isReference,
            toReference: toReference,
            storage: storage,
            cache: policies.cache,
            canRead: canRead,
            readField: function (fieldNameOrOptions, from) {
                var options = typeof fieldNameOrOptions === "string" ? {
                    fieldName: fieldNameOrOptions,
                    from: from,
                } : __assign$2({}, fieldNameOrOptions);
                if (void 0 === options.from) {
                    options.from = objectOrReference;
                }
                if (void 0 === options.variables) {
                    options.variables = variables;
                }
                return policies.readField(options, context);
            },
            mergeObjects: makeMergeObjectsFunction(getFieldValue),
        };
    }
    function makeMergeObjectsFunction(getFieldValue) {
        return function mergeObjects(existing, incoming) {
            if (Array.isArray(existing) || Array.isArray(incoming)) {
                throw process.env.NODE_ENV === "production" ? new InvariantError(2) : new InvariantError("Cannot automatically merge arrays");
            }
            if (existing && typeof existing === "object" &&
                incoming && typeof incoming === "object") {
                var eType = getFieldValue(existing, "__typename");
                var iType = getFieldValue(incoming, "__typename");
                var typesDiffer = eType && iType && eType !== iType;
                if (typesDiffer ||
                    !storeValueIsStoreObject(existing) ||
                    !storeValueIsStoreObject(incoming)) {
                    return incoming;
                }
                return __assign$2(__assign$2({}, existing), incoming);
            }
            return incoming;
        };
    }
    function keyArgsFnFromSpecifier(specifier) {
        return function (args, context) {
            return args ? context.fieldName + ":" + JSON.stringify(computeKeyObject(args, specifier, false)) : context.fieldName;
        };
    }
    function keyFieldsFnFromSpecifier(specifier) {
        var trie = new Trie(canUseWeakMap);
        return function (object, context) {
            var aliasMap;
            if (context.selectionSet && context.fragmentMap) {
                var info = trie.lookupArray([
                    context.selectionSet,
                    context.fragmentMap,
                ]);
                aliasMap = info.aliasMap || (info.aliasMap = makeAliasMap(context.selectionSet, context.fragmentMap));
            }
            var keyObject = context.keyObject =
                computeKeyObject(object, specifier, true, aliasMap);
            return context.typename + ":" + JSON.stringify(keyObject);
        };
    }
    function makeAliasMap(selectionSet, fragmentMap) {
        var map = Object.create(null);
        var workQueue = new Set([selectionSet]);
        workQueue.forEach(function (selectionSet) {
            selectionSet.selections.forEach(function (selection) {
                if (isField(selection)) {
                    if (selection.alias) {
                        var responseKey = selection.alias.value;
                        var storeKey = selection.name.value;
                        if (storeKey !== responseKey) {
                            var aliases = map.aliases || (map.aliases = Object.create(null));
                            aliases[storeKey] = responseKey;
                        }
                    }
                    if (selection.selectionSet) {
                        var subsets = map.subsets || (map.subsets = Object.create(null));
                        subsets[selection.name.value] =
                            makeAliasMap(selection.selectionSet, fragmentMap);
                    }
                }
                else {
                    var fragment = getFragmentFromSelection(selection, fragmentMap);
                    if (fragment) {
                        workQueue.add(fragment.selectionSet);
                    }
                }
            });
        });
        return map;
    }
    function computeKeyObject(response, specifier, strict, aliasMap) {
        var keyObj = Object.create(null);
        var prevKey;
        specifier.forEach(function (s) {
            if (Array.isArray(s)) {
                if (typeof prevKey === "string") {
                    var subsets = aliasMap && aliasMap.subsets;
                    var subset = subsets && subsets[prevKey];
                    keyObj[prevKey] = computeKeyObject(response[prevKey], s, strict, subset);
                }
            }
            else {
                var aliases = aliasMap && aliasMap.aliases;
                var responseName = aliases && aliases[s] || s;
                if (hasOwn.call(response, responseName)) {
                    keyObj[prevKey = s] = response[responseName];
                }
                else {
                    process.env.NODE_ENV === "production" ? invariant(!strict, 3) : invariant(!strict, "Missing field '" + responseName + "' while computing key fields");
                    prevKey = void 0;
                }
            }
        });
        return keyObj;
    }

    var defaultConfig = {
        dataIdFromObject: defaultDataIdFromObject,
        addTypename: true,
        resultCaching: true,
        typePolicies: {},
    };
    ((function (_super) {
        __extends$1(InMemoryCache, _super);
        function InMemoryCache(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this) || this;
            _this.watches = new Set();
            _this.typenameDocumentCache = new Map();
            _this.makeVar = makeVar;
            _this.txCount = 0;
            _this.maybeBroadcastWatch = wrap(function (c, fromOptimisticTransaction) {
                return _this.broadcastWatch.call(_this, c, !!fromOptimisticTransaction);
            }, {
                makeCacheKey: function (c) {
                    var store = c.optimistic ? _this.optimisticData : _this.data;
                    if (supportsResultCaching(store)) {
                        var optimistic = c.optimistic, rootId = c.rootId, variables = c.variables;
                        return store.makeCacheKey(c.query, c.callback, JSON.stringify({ optimistic: optimistic, rootId: rootId, variables: variables }));
                    }
                }
            });
            _this.watchDep = dep();
            _this.config = __assign$2(__assign$2({}, defaultConfig), config);
            _this.addTypename = !!_this.config.addTypename;
            _this.policies = new Policies({
                cache: _this,
                dataIdFromObject: _this.config.dataIdFromObject,
                possibleTypes: _this.config.possibleTypes,
                typePolicies: _this.config.typePolicies,
            });
            _this.data = new EntityStore.Root({
                policies: _this.policies,
                resultCaching: _this.config.resultCaching,
            });
            _this.optimisticData = _this.data;
            _this.storeWriter = new StoreWriter(_this, _this.storeReader = new StoreReader({
                cache: _this,
                addTypename: _this.addTypename,
            }));
            return _this;
        }
        InMemoryCache.prototype.restore = function (data) {
            if (data)
                this.data.replace(data);
            return this;
        };
        InMemoryCache.prototype.extract = function (optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return (optimistic ? this.optimisticData : this.data).extract();
        };
        InMemoryCache.prototype.read = function (options) {
            var _a = options.returnPartialData, returnPartialData = _a === void 0 ? false : _a;
            try {
                return this.storeReader.diffQueryAgainstStore({
                    store: options.optimistic ? this.optimisticData : this.data,
                    query: options.query,
                    variables: options.variables,
                    rootId: options.rootId,
                    config: this.config,
                    returnPartialData: returnPartialData,
                }).result || null;
            }
            catch (e) {
                if (e instanceof MissingFieldError) {
                    return null;
                }
                throw e;
            }
        };
        InMemoryCache.prototype.write = function (options) {
            try {
                ++this.txCount;
                return this.storeWriter.writeToStore({
                    store: this.data,
                    query: options.query,
                    result: options.result,
                    dataId: options.dataId,
                    variables: options.variables,
                });
            }
            finally {
                if (!--this.txCount && options.broadcast !== false) {
                    this.broadcastWatches();
                }
            }
        };
        InMemoryCache.prototype.modify = function (options) {
            if (hasOwn.call(options, "id") && !options.id) {
                return false;
            }
            var store = options.optimistic
                ? this.optimisticData
                : this.data;
            try {
                ++this.txCount;
                return store.modify(options.id || "ROOT_QUERY", options.fields);
            }
            finally {
                if (!--this.txCount && options.broadcast !== false) {
                    this.broadcastWatches();
                }
            }
        };
        InMemoryCache.prototype.diff = function (options) {
            return this.storeReader.diffQueryAgainstStore({
                store: options.optimistic ? this.optimisticData : this.data,
                rootId: options.id || "ROOT_QUERY",
                query: options.query,
                variables: options.variables,
                returnPartialData: options.returnPartialData,
                config: this.config,
            });
        };
        InMemoryCache.prototype.watch = function (watch) {
            var _this = this;
            if (!this.watches.size) {
                recallCache(this);
            }
            this.watches.add(watch);
            if (watch.immediate) {
                this.maybeBroadcastWatch(watch);
            }
            return function () {
                if (_this.watches.delete(watch) && !_this.watches.size) {
                    forgetCache(_this);
                }
                _this.watchDep.dirty(watch);
                _this.maybeBroadcastWatch.forget(watch);
            };
        };
        InMemoryCache.prototype.gc = function () {
            return this.optimisticData.gc();
        };
        InMemoryCache.prototype.retain = function (rootId, optimistic) {
            return (optimistic ? this.optimisticData : this.data).retain(rootId);
        };
        InMemoryCache.prototype.release = function (rootId, optimistic) {
            return (optimistic ? this.optimisticData : this.data).release(rootId);
        };
        InMemoryCache.prototype.identify = function (object) {
            return isReference(object) ? object.__ref :
                this.policies.identify(object)[0];
        };
        InMemoryCache.prototype.evict = function (options) {
            if (!options.id) {
                if (hasOwn.call(options, "id")) {
                    return false;
                }
                options = __assign$2(__assign$2({}, options), { id: "ROOT_QUERY" });
            }
            try {
                ++this.txCount;
                return this.optimisticData.evict(options);
            }
            finally {
                if (!--this.txCount && options.broadcast !== false) {
                    this.broadcastWatches();
                }
            }
        };
        InMemoryCache.prototype.reset = function () {
            this.data.clear();
            this.optimisticData = this.data;
            this.broadcastWatches();
            return Promise.resolve();
        };
        InMemoryCache.prototype.removeOptimistic = function (idToRemove) {
            var newOptimisticData = this.optimisticData.removeLayer(idToRemove);
            if (newOptimisticData !== this.optimisticData) {
                this.optimisticData = newOptimisticData;
                this.broadcastWatches();
            }
        };
        InMemoryCache.prototype.performTransaction = function (transaction, optimisticId) {
            var _this = this;
            var perform = function (layer) {
                var _a = _this, data = _a.data, optimisticData = _a.optimisticData;
                ++_this.txCount;
                if (layer) {
                    _this.data = _this.optimisticData = layer;
                }
                try {
                    transaction(_this);
                }
                finally {
                    --_this.txCount;
                    _this.data = data;
                    _this.optimisticData = optimisticData;
                }
            };
            var fromOptimisticTransaction = false;
            if (typeof optimisticId === 'string') {
                this.optimisticData = this.optimisticData.addLayer(optimisticId, perform);
                fromOptimisticTransaction = true;
            }
            else if (optimisticId === null) {
                perform(this.data);
            }
            else {
                perform();
            }
            this.broadcastWatches(fromOptimisticTransaction);
        };
        InMemoryCache.prototype.transformDocument = function (document) {
            if (this.addTypename) {
                var result = this.typenameDocumentCache.get(document);
                if (!result) {
                    result = addTypenameToDocument(document);
                    this.typenameDocumentCache.set(document, result);
                    this.typenameDocumentCache.set(result, result);
                }
                return result;
            }
            return document;
        };
        InMemoryCache.prototype.broadcastWatches = function (fromOptimisticTransaction) {
            var _this = this;
            if (!this.txCount) {
                this.watches.forEach(function (c) { return _this.maybeBroadcastWatch(c, fromOptimisticTransaction); });
            }
        };
        InMemoryCache.prototype.broadcastWatch = function (c, fromOptimisticTransaction) {
            this.watchDep.dirty(c);
            this.watchDep(c);
            var diff = this.diff({
                query: c.query,
                variables: c.variables,
                optimistic: c.optimistic,
            });
            if (c.optimistic && fromOptimisticTransaction) {
                diff.fromOptimisticTransaction = true;
            }
            c.callback(diff);
        };
        return InMemoryCache;
    })(ApolloCache));

    setVerbosity("log");
    gql$1.resetCaches; gql$1.disableFragmentWarnings; gql$1.enableExperimentalFragmentVariables; gql$1.disableExperimentalFragmentVariables;

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var CLIENT = typeof Symbol !== "undefined" ? Symbol("client") : "@@client";
    function getClient() {
        var client = getContext(CLIENT);
        if (!client) {
            throw new Error("ApolloClient has not been set yet, use setClient(new ApolloClient({ ... })) to define it");
        }
        return client;
    }
    function setClient(client) {
        setContext(CLIENT, client);
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function observableToReadable(observable, initialValue) {
        if (initialValue === void 0) { initialValue = {
            loading: true,
            data: undefined,
            error: undefined,
        }; }
        var store = readable(initialValue, function (set) {
            var skipDuplicate = (initialValue === null || initialValue === void 0 ? void 0 : initialValue.data) !== undefined;
            var skipped = false;
            var subscription = observable.subscribe(function (result) {
                if (skipDuplicate && !skipped) {
                    skipped = true;
                    return;
                }
                if (result.errors) {
                    var error = new ApolloError({ graphQLErrors: result.errors });
                    set({ loading: false, data: undefined, error: error });
                }
                else {
                    set({ loading: false, data: result.data, error: undefined });
                }
            }, function (error) { return set({ loading: false, data: undefined, error: error }); });
            return function () { return subscription.unsubscribe(); };
        });
        return store;
    }
    var extensions = [
        "fetchMore",
        "getCurrentResult",
        "getLastError",
        "getLastResult",
        "isDifferentFromLastResult",
        "refetch",
        "resetLastResults",
        "resetQueryStoreErrors",
        "result",
        "setOptions",
        "setVariables",
        "startPolling",
        "stopPolling",
        "subscribeToMore",
        "updateQuery",
    ];
    function observableQueryToReadable(query, initialValue) {
        var store = observableToReadable(query, initialValue);
        for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
            var extension = extensions_1[_i];
            store[extension] = query[extension].bind(query);
        }
        return store;
    }

    var restoring = typeof WeakSet !== "undefined" ? new WeakSet() : new Set();

    function query(query, options) {
        if (options === void 0) { options = {}; }
        var client = getClient();
        var queryOptions = __assign(__assign({}, options), { query: query });
        // If client is restoring (e.g. from SSR), attempt synchronous readQuery first
        var initialValue;
        if (restoring.has(client)) {
            try {
                // undefined = skip initial value (not in cache)
                initialValue = client.readQuery(queryOptions) || undefined;
            }
            catch (err) {
                // Ignore preload errors
            }
        }
        var observable = client.watchQuery(queryOptions);
        var store = observableQueryToReadable(observable, initialValue !== undefined
            ? {
                data: initialValue,
            }
            : undefined);
        return store;
    }

    /* src/Todo.svelte generated by Svelte v3.37.0 */
    const file$1 = "src/Todo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (34:2) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*$movies*/ ctx[0].data["allMovies"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$movies*/ 1) {
    				each_value = /*$movies*/ ctx[0].data["allMovies"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(34:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (31:26) 
    function create_if_block_1(ctx) {
    	let t0;
    	let t1_value = /*$movies*/ ctx[0].error.message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Error:\n    ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$movies*/ 1 && t1_value !== (t1_value = /*$movies*/ ctx[0].error.message + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(31:26) ",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if $movies.loading}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(29:2) {#if $movies.loading}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#each $movies.data['allMovies'] as movie}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let small;
    	let t1_value = /*movie*/ ctx[3].title + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			small = element("small");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(img, "class", "fav");
    			if (img.src !== (img_src_value = "https://image.tmdb.org/t/p/w500" + /*movie*/ ctx[3].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "200");
    			attr_dev(img, "alt", img_alt_value = /*movie*/ ctx[3].title);
    			add_location(img, file$1, 37, 10, 694);
    			attr_dev(div0, "class", "img-container");
    			add_location(div0, file$1, 36, 8, 656);
    			add_location(small, file$1, 43, 8, 867);
    			attr_dev(div1, "class", "movie-item");
    			add_location(div1, file$1, 35, 6, 623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, small);
    			append_dev(small, t1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$movies*/ 1 && img.src !== (img_src_value = "https://image.tmdb.org/t/p/w500" + /*movie*/ ctx[3].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$movies*/ 1 && img_alt_value !== (img_alt_value = /*movie*/ ctx[3].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*$movies*/ 1 && t1_value !== (t1_value = /*movie*/ ctx[3].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:4) {#each $movies.data['allMovies'] as movie}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let h2;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*$movies*/ ctx[0].loading) return create_if_block;
    		if (/*$movies*/ ctx[0].error) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Svedos";
    			t1 = space();
    			if_block.c();
    			add_location(h2, file$1, 26, 2, 438);
    			set_style(div, "text-align", "center");
    			add_location(div, file$1, 25, 0, 404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $movies;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Todo", slots, []);

    	const GET_MOVIES = gql$1`
    query Movie {
      allMovies {
        id
        title
        description
        image
        releaseDate
        watched
      }
    }
  `;

    	const movies = query(GET_MOVIES);
    	validate_store(movies, "movies");
    	component_subscribe($$self, movies, value => $$invalidate(0, $movies = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ query, gql: gql$1, GET_MOVIES, movies, $movies });
    	return [$movies, movies];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let todo;
    	let current;
    	todo = new Todo({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Hello ");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			create_component(todo.$$.fragment);
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file, 40, 1, 684);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 39, 0, 676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(main, t3);
    			mount_component(todo, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(todo);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name } = $$props;

    	const client = new DefaultClient({
    			uri: "http://localhost:4000/graphql",
    			onError: ({ networkError, graphQLErrors }) => {
    				console.log("graphQLErrors", graphQLErrors);
    				console.log("networkError", networkError);
    			}
    		});

    	setClient(client);
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		ApolloClient: DefaultClient,
    		setClient,
    		Todo,
    		client
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Mix'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
