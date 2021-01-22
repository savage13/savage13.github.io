
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.6' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
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

    function loader (urls, test, callback) {
      let remaining = urls.length;

      function maybeCallback () {
        remaining = --remaining;
        if (remaining < 1) {
          callback();
        }
      }

      if (!test()) {
        urls.forEach(({ type, url, options = { async: true, defer: true }}) => {
          const isScript = type === 'script';
          const tag = document.createElement(isScript ? 'script': 'link');
          if (isScript) {
            tag.src = url;
            tag.async = options.async;
            tag.defer = options.defer;
          } else {
            tag.rel = 'stylesheet';
    		    tag.href = url;
          }
          tag.onload = maybeCallback;
          document.body.appendChild(tag);
        });
      } else {
        callback();
      }
    }

    const subscriber_queue = [];
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

    const mapsLoaded = writable(false);
    const mapsLoading = writable(false);

    /* node_modules/@anoram/leaflet-svelte/src/LoadSdk.svelte generated by Svelte v3.29.6 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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
    	let $mapsLoaded;
    	let $mapsLoading;
    	validate_store(mapsLoaded, "mapsLoaded");
    	component_subscribe($$self, mapsLoaded, $$value => $$invalidate(2, $mapsLoaded = $$value));
    	validate_store(mapsLoading, "mapsLoading");
    	component_subscribe($$self, mapsLoading, $$value => $$invalidate(3, $mapsLoading = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LoadSdk", slots, []);
    	const dispatch = createEventDispatcher();
    	let L = {};
    	let map = "";

    	onMount(() => {
    		if ($mapsLoaded) {
    			dispatch("ready");
    		}

    		if (!$mapsLoading) {
    			mapsLoading.set(true);

    			loader(
    				[
    					{
    						type: "style",
    						url: `https://unpkg.com/leaflet@1.7.1/dist/leaflet.css`
    					},
    					{
    						type: "script",
    						url: `https://unpkg.com/leaflet@1.7.1/dist/leaflet.js`
    					}
    				],
    				() => {
    					return false;
    				},
    				() => {
    					L = window.L;
    					map = L.map;
    					mapsLoaded.set(true);
    					return true;
    				}
    			);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoadSdk> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		loader,
    		createEventDispatcher,
    		onMount,
    		mapsLoaded,
    		mapsLoading,
    		dispatch,
    		L,
    		map,
    		$mapsLoaded,
    		$mapsLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ("L" in $$props) L = $$props.L;
    		if ("map" in $$props) map = $$props.map;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mapsLoaded*/ 4) {
    			 $mapsLoaded && dispatch("ready");
    		}
    	};

    	return [];
    }

    class LoadSdk extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoadSdk",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* node_modules/@anoram/leaflet-svelte/src/Leaflet.svelte generated by Svelte v3.29.6 */

    const { console: console_1, window: window_1 } = globals;
    const file = "node_modules/@anoram/leaflet-svelte/src/Leaflet.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let loadsdk;
    	let current;
    	let mounted;
    	let dispose;
    	loadsdk = new LoadSdk({ $$inline: true });
    	loadsdk.$on("ready", /*initialise*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			create_component(loadsdk.$$.fragment);
    			attr_dev(div, "class", "map svelte-1fktu84");
    			attr_dev(div, "id", /*mapID*/ ctx[0]);
    			add_location(div, file, 266, 0, 6505);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(loadsdk, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*resizeMap*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadsdk.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadsdk.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			destroy_component(loadsdk, detaching);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Leaflet", slots, []);
    	let L = {};
    	let map = "";
    	const dispatch = createEventDispatcher();
    	let { options } = $$props;

    	function on(event, fx) {
    		return map.on(event, fx);
    	}

    	let { zoom = 13, maxZoom = 19, minZoom = 1, mapID = "map", attributionControl = true, center = [0, 0], markers, circles, recenter = false, scrollWheelZoom = true, tilelayers = [
    		{
    			url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    			attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    		}
    	], controls = {
    		zoomControl: true,
    		position: "topleft",
    		scale: false
    	} } = options;

    	let icon;
    	let markersArray = [];
    	let circleArray = [];
    	let bounds;

    	let defaultIcon = {
    		iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    		iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    		shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    		iconSize: [25, 41],
    		iconAnchor: [12, 41],
    		popupAnchor: [1, -34],
    		tooltipAnchor: [1, -34],
    		shadowSize: [41, 41]
    	};

    	function initialise() {
    		setTimeout(
    			() => {
    				L = window["L"];
    				createMap();
    				dispatch("ready");
    			},
    			1
    		);
    	}

    	function makePopup(marker, options) {
    		marker.bindPopup(options.text, {
    			closeOnClick: false,
    			autoClose: false,
    			...options
    		}).addTo(map);

    		if (options.isOpen) {
    			marker.openPopup();
    		}
    	}

    	function makeTooltip(marker, options) {
    		marker.bindTooltip(options.text, { ...options }).addTo(map);

    		if (options.isOpen) {
    			marker.openTooltip();
    		}
    	}

    	let m = [];
    	let c = {};

    	const addMarker = obj => {
    		//obj.circles.map((e,i) => {
    		//c[e.stat] = new L.circle([e.lat,e.lng],e.r, e.options).addTo(map);
    		//});
    		obj.markers.map((e, i) => {
    			if (e.icon) {
    				// console.log(e.icon)
    				icon = L.icon(e.icon);
    			}

    			m[i] = new L.marker([e.lat, e.lng], { icon }).addTo(map);

    			if (e.popup) {
    				makePopup(m[i], e.popup);
    			}

    			if (e.tooltip) {
    				makeTooltip(m[i], e.tooltip);
    			}
    		});
    	};

    	let added = false;

    	const updateMarkers = obj => {
    		if (!added) {
    			addMarker(obj);
    			added = true;
    		}

    		if ("circles" in obj) {
    			obj.circles.map((e, k) => {
    				//console.log(e.key);
    				if (!(e.key in c)) {
    					c[e.key] = new L.circle([e.lat, e.lng], e.r, e.options);
    					c[e.key].addTo(map);
    				} else {
    					c[e.key].setRadius(e.r);
    				}
    			});
    		}

    		if ("markers" in obj) {
    			obj.markers.map((i, k) => {
    				// console.log(i);
    				m[k].setLatLng(i).update();

    				m[k].addTo(map);
    			});
    		}
    	}; // map.panTo(arr[0])
    	// console.log(m);

    	const setZoom = (x = 5) => {
    		map.setZoom(x);
    	};

    	function createMap() {
    		map = L.map(mapID, {
    			attributionControl,
    			zoomControl: controls.zoomControl,
    			minZoom,
    			maxZoom
    		}).setView(center, zoom);

    		m = L.marker([0, 0]);

    		if (tilelayers) {
    			tilelayers.map(e => {
    				L.tileLayer(e.url, { ...e }).addTo(map);
    			});
    		}

    		if (!scrollWheelZoom) {
    			map.scrollWheelZoom.disable();
    		}

    		let controlElement = L.control;

    		if (!controls.zoomControl) {
    			controlElement().remove();
    		}

    		if (controls.scale) {
    			controlElement.scale({ position: controls.position }).addTo(map);
    		}

    		if (controls.zoomControl && controls.position) {
    			map.removeControl(map.zoomControl);
    			controlElement.zoom({ position: controls.position }).addTo(map);
    		}

    		if (markers) {
    			markers.map(e => {
    				markersArray.push([e.lat, e.lng]);

    				if (e.icon) {
    					icon = L.icon(e.icon);
    				} else {
    					icon = L.icon(defaultIcon);
    				}

    				let marker = new L.marker([e.lat, e.lng], { icon });

    				if (e.popup) {
    					makePopup(marker, e.popup);
    				}

    				if (e.tooltip) {
    					makeTooltip(marker, e.tooltip);
    				}

    				marker.addTo(map);
    			});
    		}

    		if (circles) {
    			circles.map(e => {
    				circleArray.push([e.lat, e.lng]);
    				let circle = new L.circle([e.lat, e.lng], { ...e });

    				if (e.popup) {
    					makePopup(circle, e.popup);
    				}

    				if (e.tooltip) {
    					makeTooltip(circle, e.tooltip);
    				}

    				circle.addTo(map);
    			});
    		}

    		if (recenter) {
    			if (markersArray.length == 1) {
    				map.panTo(L.latLng(markersArray[0][0], markersArray[0][1]));
    				map.setZoom(zoom);
    			} else {
    				bounds = new L.LatLngBounds(markersArray);
    				map.fitBounds(bounds);
    			}
    		}

    		let Position = L.Control.extend({
    			_container: null,
    			options: { position: "bottomleft" },
    			onAdd(map) {
    				var latlng = L.DomUtil.create("div", "pos");
    				this._latlng = latlng;
    				return latlng;
    			},
    			updateHTML(lat, lng) {
    				var latlng = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    				this._latlng.innerHTML = latlng;
    			}
    		});

    		let position = new Position();
    		map.addControl(position);

    		map.addEventListener("mousemove", function (ev) {
    			position.updateHTML(ev.latlng.lat, ev.latlng.lng);
    		});

    		map.on("click", function (ev) {
    			console.log("CLICK MAP");
    			var marker = new L.marker(ev.latlng).addTo(map).bindPopup(`${ev.latlng.lat.toFixed(5)}, ${ev.latlng.lng.toFixed(5)}`).openPopup();
    		});
    	}

    	function resizeMap() {
    		if (map) {
    			map.invalidateSize();
    		}
    	}

    	const writable_props = ["options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Leaflet> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(3, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		LoadSdk,
    		createEventDispatcher,
    		L,
    		map,
    		dispatch,
    		options,
    		on,
    		zoom,
    		maxZoom,
    		minZoom,
    		mapID,
    		attributionControl,
    		center,
    		markers,
    		circles,
    		recenter,
    		scrollWheelZoom,
    		tilelayers,
    		controls,
    		icon,
    		markersArray,
    		circleArray,
    		bounds,
    		defaultIcon,
    		initialise,
    		makePopup,
    		makeTooltip,
    		m,
    		c,
    		addMarker,
    		added,
    		updateMarkers,
    		setZoom,
    		createMap,
    		resizeMap
    	});

    	$$self.$inject_state = $$props => {
    		if ("L" in $$props) L = $$props.L;
    		if ("map" in $$props) map = $$props.map;
    		if ("options" in $$props) $$invalidate(3, options = $$props.options);
    		if ("zoom" in $$props) zoom = $$props.zoom;
    		if ("maxZoom" in $$props) maxZoom = $$props.maxZoom;
    		if ("minZoom" in $$props) minZoom = $$props.minZoom;
    		if ("mapID" in $$props) $$invalidate(0, mapID = $$props.mapID);
    		if ("attributionControl" in $$props) attributionControl = $$props.attributionControl;
    		if ("center" in $$props) center = $$props.center;
    		if ("markers" in $$props) markers = $$props.markers;
    		if ("circles" in $$props) circles = $$props.circles;
    		if ("recenter" in $$props) recenter = $$props.recenter;
    		if ("scrollWheelZoom" in $$props) scrollWheelZoom = $$props.scrollWheelZoom;
    		if ("tilelayers" in $$props) tilelayers = $$props.tilelayers;
    		if ("controls" in $$props) controls = $$props.controls;
    		if ("icon" in $$props) icon = $$props.icon;
    		if ("markersArray" in $$props) markersArray = $$props.markersArray;
    		if ("circleArray" in $$props) circleArray = $$props.circleArray;
    		if ("bounds" in $$props) bounds = $$props.bounds;
    		if ("defaultIcon" in $$props) defaultIcon = $$props.defaultIcon;
    		if ("m" in $$props) m = $$props.m;
    		if ("c" in $$props) c = $$props.c;
    		if ("added" in $$props) added = $$props.added;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mapID, initialise, resizeMap, options, on, addMarker, updateMarkers, setZoom];
    }

    class Leaflet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				options: 3,
    				on: 4,
    				addMarker: 5,
    				updateMarkers: 6,
    				setZoom: 7
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leaflet",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[3] === undefined && !("options" in props)) {
    			console_1.warn("<Leaflet> was created without expected prop 'options'");
    		}
    	}

    	get options() {
    		throw new Error("<Leaflet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Leaflet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get on() {
    		return this.$$.ctx[4];
    	}

    	set on(value) {
    		throw new Error("<Leaflet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addMarker() {
    		return this.$$.ctx[5];
    	}

    	set addMarker(value) {
    		throw new Error("<Leaflet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateMarkers() {
    		return this.$$.ctx[6];
    	}

    	set updateMarkers(value) {
    		throw new Error("<Leaflet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setZoom() {
    		return this.$$.ctx[7];
    	}

    	set setZoom(value) {
    		throw new Error("<Leaflet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Waveform.svelte generated by Svelte v3.29.6 */
    const file$1 = "src/Waveform.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div;
    	let canvas_1;
    	let canvas_1_id_value;
    	let div_id_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "class", "blarg");
    			attr_dev(canvas_1, "id", canvas_1_id_value = "canvas" + /*data*/ ctx[0].SID);
    			attr_dev(canvas_1, "width", "100");
    			attr_dev(canvas_1, "height", /*height*/ ctx[1]);
    			add_location(canvas_1, file$1, 356, 4, 8940);
    			attr_dev(div, "class", "chart2div svelte-98iwyc");
    			attr_dev(div, "id", div_id_value = "cdiv" + /*data*/ ctx[0].SID);
    			add_location(div, file$1, 355, 2, 8889);
    			add_location(main, file$1, 354, 0, 8880);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, canvas_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*data*/ 1 && canvas_1_id_value !== (canvas_1_id_value = "canvas" + /*data*/ ctx[0].SID)) {
    				attr_dev(canvas_1, "id", canvas_1_id_value);
    			}

    			if (dirty[0] & /*height*/ 2) {
    				attr_dev(canvas_1, "height", /*height*/ ctx[1]);
    			}

    			if (dirty[0] & /*data*/ 1 && div_id_value !== (div_id_value = "cdiv" + /*data*/ ctx[0].SID)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function on_click(ev) {
    	
    } //console.log("CLICK",ev);
    //zoom(ev);

    function line(ctx, x0, x1, y0, y1, color, width) {
    	ctx.save();
    	ctx.strokeStyle = color;
    	ctx.lineWidth = width;
    	ctx.beginPath();
    	ctx.moveTo(x0, y0);
    	ctx.lineTo(x1, y1);
    	ctx.stroke();
    	ctx.restore();
    }

    function vline(ctx, x, y0, y1, color, width) {
    	line(ctx, x, x, y0, y1, color, width);
    }

    function draw_marker(ctx, t, y0, y1, marker) {
    	if (marker.hover) {
    		vline(ctx, t, y0, y1, marker.color_hover, marker.width_hover);
    	}

    	vline(ctx, t, y0, y1, marker.color, marker.width);
    }

    function best_tick(largest, mostticks) {
    	var min = largest / mostticks;
    	var mag = Math.pow(10, Math.floor(Math.log10(min)));
    	var res = min / mag;

    	if (res > 5) {
    		return 10 * mag;
    	} else if (res > 2) {
    		return 5 * mag;
    	} else if (res > 1) {
    		return 2 * mag;
    	}

    	return mag;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Waveform", slots, []);
    	let { data } = $$props;
    	let { height = 100 } = $$props;
    	let ctx;
    	let vmin = 0;
    	let vmax = 0;
    	var b0 = 0;
    	var e0 = 0;
    	let b = 0;
    	let e = 0;
    	let xbuffer = 15;
    	let ybuffer = 15;
    	let w0 = xbuffer;
    	let h0 = ybuffer;
    	let width0 = 0; // canvas.width;
    	let height0 = 0; // canvas.height;
    	let width1 = 0; // width0  - xbuffer * 2;
    	let height1 = 0; //height0 - ybuffer * 2;
    	let drag = { x: 0, y: 0, on: false };

    	let marker_p = {
    		hover: false,
    		color: "rgba(255,0,0,0.7)",
    		width: 4,
    		color_hover: "rgba(255,0,0,0.5)",
    		width_hover: 8,
    		t: data.tp,
    		phase: "p"
    	};

    	let marker_s = {
    		hover: false,
    		color: "rgba(0,0,255,0.7)",
    		width: 4,
    		color_hover: "rgba(0,0,255,0.5)",
    		width_hover: 8,
    		t: data.ts,
    		phase: "s"
    	};

    	const dispatch = createEventDispatcher();
    	let canvas;

    	onMount(async () => {
    		canvas = document.querySelector(`#canvas${data.SID}`);
    		var asd = document.querySelector(`#cdiv${data.SID}`);
    		ctx = canvas.getContext("2d");
    		window.addEventListener("resize", resizeDiv, false);
    		canvas.addEventListener("click", on_click);
    		canvas.addEventListener("wheel", on_wheel);
    		canvas.addEventListener("mousemove", mousemove);
    		canvas.addEventListener("mousedown", mousedown);
    		canvas.addEventListener("mouseup", mouseup);
    		width0 = canvas.width;
    		height0 = canvas.height;
    		width1 = width0 - 2 * xbuffer;
    		height1 = height0 - 2 * ybuffer;

    		//console.log(data.tp, data.ts);
    		// Determine y-limits of data
    		let v = data.amp;

    		b = 0;

    		for (var i = 1; i < v.length; i++) {
    			if (v[i] < vmin) {
    				vmin = v[i];
    			}

    			if (v[i] > vmax) {
    				vmax = v[i];
    			}
    		}

    		// x-limits of data
    		e = b + data.npts * data.dt;

    		b0 = b;
    		e0 = e;
    		resizeDiv();
    	});

    	function mousedown(ev) {
    		//console.log("MOUSE DOWN");
    		drag.x = ev.offsetX;

    		drag.y = ev.offsetY;
    		drag.on = true;
    		ev.preventDefault();
    	}

    	function mouseup(ev) {
    		//console.log("MOUSE UP");
    		drag.on = false;

    		ev.preventDefault();
    	}

    	function update_phase(m, t) {
    		m.t = t;
    		$$invalidate(0, data[`t${m.phase}`] = t, data);
    		dispatch("update", { tp: data.tp, ts: data.ts, sid: data.SID });
    	}

    	function mousemove(ev) {
    		//console.log("MOUSE MOVE", ev.offsetX);
    		if (ev.buttons === 0) {
    			drag.on = false;
    		}

    		if (drag.on === false) {
    			var x = ev.offsetX;
    			let up = false;

    			[marker_p, marker_s].forEach(m => {
    				var xp = t2x(m.t);
    				var hover0 = m.hover;

    				if (Math.abs(x - xp) < 4) {
    					m.hover = true;
    				} else {
    					m.hover = false;
    				}

    				if (m.hover !== hover0) {
    					up = true;
    				}
    			});

    			if (up) {
    				update();
    			}
    		} else {
    			ev.preventDefault();
    			let up = false;

    			[marker_p, marker_s].forEach(m => {
    				if (m.hover) {
    					// Drag the marker
    					update_phase(m, x2t(ev.offsetX));

    					up = true;
    				}
    			});

    			if (up) {
    				update();
    			} else {
    				// Drag the data
    				var t = x2t(ev.offsetX);

    				var t0 = x2t(drag.x);
    				drag.x = ev.offsetX;
    				drag.y = ev.offsetY;
    				var dt = t0 - t;

    				//console.log('DRAG',b,e);
    				set_b_e(b + dt, e + dt);
    			}
    		}
    	} //console.log("DRAG/UPDATE DONE");

    	function on_wheel(ev) {
    		//console.log("WHEEL");
    		zoom(ev);
    	}

    	function t2x(t) {
    		var dx = width1 / (e - b);
    		var x = (t - b) * dx + w0;
    		return x;
    	}

    	function x2t(x) {
    		var dx = width1 / (e - b);
    		var t = b + (x - w0) / dx;
    		return t;
    	}

    	function zoom(ev) {
    		//console.log("ZOOM", ev.deltaY);
    		let x = ev.offsetX;

    		//console.log("WHEEL",e.clientX, e.clientY, e.offsetX, e.offsetY);
    		if (x < w0 || x > w0 + width1) {
    			return true;
    		}

    		ev.preventDefault();
    		var t = x2t(ev.offsetX);

    		//console.log("EV", ev.deltaY * 0.001);
    		//var p = (1.0 - ev.deltaY * 0.05);
    		var fac = 0.025;

    		var p = 1 - fac;

    		if (ev.deltaY < 0 || ev.shiftKey === true) {
    			p = 1 + fac;
    		}

    		var dt = e - b;
    		var new_dt = dt * p;

    		if (new_dt > e0 - b0) {
    			new_dt = e0 - b0;
    		}

    		var b1 = t - new_dt * (t - b) / (e - b);
    		var e1 = t + new_dt * (e - t) / (e - b);
    		set_b_e(b1, e1);
    	}

    	function set_b_e(b1, e1) {
    		if (b1 < b0 && e1 > e0) {
    			// Window too big
    			//console.log("ZOOM BIG",b1,e1);
    			b = b0;

    			e = e0;
    		} else if (b1 >= b0 && e1 <= e0) {
    			// Window fits within
    			//console.log("ZOOM FITS",b1,e1);
    			b = b1;

    			e = e1;
    		} else if (b1 < b0 && e1 < e0) {
    			// Bounds b0
    			//console.log("ZOOM B0",b1,e1);
    			b = b0;

    			e = b + (e1 - b1);
    		} else if (b1 > b0 && e1 > e0) {
    			// Bounds e0
    			//console.log("ZOOM E0",b1,e1);
    			e = e0;

    			b = e - (e1 - b1);
    		}

    		if (e - b < 10 * data.dt) {
    			e = b + 10 * data.dt;
    		}

    		//console.log('WHEEL', t.toFixed(2), 'b1,e1',b1.toFixed(2),e1.toFixed(2), 'b,e',b.toFixed(2), e.toFixed(2), p, 't',(e-b).toFixed(2), new_dt.toFixed(2));
    		update();
    	}

    	function resizeDiv() {
    		//console.log("RESIZE DIV");
    		var asd = document.querySelector(`#cdiv${data.SID}`);

    		//console.log("RESIZE", canvas);
    		//console.log("RESIZE",asd.clientWidth, asd.clientHeight);
    		canvas.width = asd.clientWidth;

    		//canvas.height = asd.clientHeight;
    		//console.log("      ",canvas.width, canvas.height);
    		width0 = canvas.width;

    		height0 = canvas.height;
    		width1 = width0 - 2 * xbuffer;
    		height1 = height0 - 2 * ybuffer;
    		update();
    	}

    	function clear() {
    		ctx.save();
    		ctx.fillStyle = "white";
    		ctx.clearRect(0, 0, width0, height0);
    		ctx.restore();
    	}

    	function update() {
    		//console.log("UPDATE");
    		clear();

    		ctx.style = "black";
    		let t0 = 0;
    		ctx.beginPath();
    		ctx.strokeRect(w0, h0, width1, height1);
    		let dx = width1 / (e - b);
    		let dy = height1 / (vmax - vmin);
    		var rx = v => w0 + (v - b) * dx;
    		var ry = v => h0 + (v - vmin) * dy;
    		var px = v => w0 + v * width1;
    		var py = v => h0 + v * height1;

    		//console.log(b,e,dx,dy);
    		let v = data.amp;

    		for (var i = 0; i < v.length; i++) {
    			let x = rx(t0 + i * data.dt); // x0 + i * dx;
    			let y = ry(v[i]);

    			if (i == 0) {
    				ctx.moveTo(x, y);
    			} else {
    				ctx.lineTo(x, y);
    			}
    		}

    		ctx.stroke();
    		draw_time_axis(ctx, rx, ry, px, py);
    		draw_markers(ctx, rx, ry, px, py);
    	}

    	function draw_time_axis(ctx, rx, ry, px, py) {
    		var max_nticks = 7;
    		var tick_length = 5;
    		var minor_tick_length = 3;
    		var t0 = b;
    		var t1 = e;
    		var tick = best_tick(t1 - t0, max_nticks);
    		var mtick = best_tick(tick, max_nticks);
    		var t = Math.floor(b / tick) * tick;
    		ctx.save();

    		while (t <= t1) {
    			// Major Ticks
    			if (t >= t0 && t <= t1) {
    				ctx.textAlign = "center";
    				ctx.textBaseline = "top";
    				ctx.fillText(t, rx(t), py(1) + tick_length);
    				ctx.beginPath();
    				ctx.moveTo(rx(t), py(1));
    				ctx.lineTo(rx(t), py(1) + tick_length);
    				ctx.stroke();
    			}

    			// Minor Ticks
    			var tx = t + mtick;

    			while (tx < t + tick && tx < t1) {
    				if (tx >= t0 && tx <= t1) {
    					ctx.beginPath();
    					ctx.moveTo(rx(tx), py(1));
    					ctx.lineTo(rx(tx), py(1) + minor_tick_length);
    					ctx.stroke();
    				}

    				tx += mtick;
    			}

    			t += tick;
    		}

    		ctx.restore();
    	}

    	function draw_markers(ctx, rx, ry, px, py) {
    		[[marker_p, data.tp], [marker_s, data.ts]].forEach(v => {
    			draw_marker(ctx, rx(v[1]), py(0), py(1), v[0]);
    		});
    	}

    	const writable_props = ["data", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Waveform> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		data,
    		height,
    		ctx,
    		vmin,
    		vmax,
    		b0,
    		e0,
    		b,
    		e,
    		xbuffer,
    		ybuffer,
    		w0,
    		h0,
    		width0,
    		height0,
    		width1,
    		height1,
    		drag,
    		marker_p,
    		marker_s,
    		dispatch,
    		canvas,
    		mousedown,
    		mouseup,
    		update_phase,
    		mousemove,
    		on_click,
    		on_wheel,
    		t2x,
    		x2t,
    		zoom,
    		set_b_e,
    		resizeDiv,
    		clear,
    		update,
    		draw_time_axis,
    		line,
    		vline,
    		draw_marker,
    		draw_markers,
    		best_tick
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("ctx" in $$props) ctx = $$props.ctx;
    		if ("vmin" in $$props) vmin = $$props.vmin;
    		if ("vmax" in $$props) vmax = $$props.vmax;
    		if ("b0" in $$props) b0 = $$props.b0;
    		if ("e0" in $$props) e0 = $$props.e0;
    		if ("b" in $$props) b = $$props.b;
    		if ("e" in $$props) e = $$props.e;
    		if ("xbuffer" in $$props) xbuffer = $$props.xbuffer;
    		if ("ybuffer" in $$props) ybuffer = $$props.ybuffer;
    		if ("w0" in $$props) w0 = $$props.w0;
    		if ("h0" in $$props) h0 = $$props.h0;
    		if ("width0" in $$props) width0 = $$props.width0;
    		if ("height0" in $$props) height0 = $$props.height0;
    		if ("width1" in $$props) width1 = $$props.width1;
    		if ("height1" in $$props) height1 = $$props.height1;
    		if ("drag" in $$props) drag = $$props.drag;
    		if ("marker_p" in $$props) marker_p = $$props.marker_p;
    		if ("marker_s" in $$props) marker_s = $$props.marker_s;
    		if ("canvas" in $$props) canvas = $$props.canvas;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, height];
    }

    class Waveform extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 0, height: 1 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Waveform",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Waveform> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Waveform>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Waveform>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Waveform>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Waveform>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.6 */

    const { Map: Map_1, console: console_1$1 } = globals;
    const file$2 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (214:4) {:else }
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading data...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(214:4) {:else }",
    		ctx
    	});

    	return block;
    }

    // (207:4) {#each waveforms as w (w.SID) }
    function create_each_block(key_1, ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*w*/ ctx[12].SID + "";
    	let t0;
    	let t1;
    	let div1;
    	let waveform;
    	let updating_data;
    	let t2;
    	let current;

    	function waveform_data_binding(value) {
    		/*waveform_data_binding*/ ctx[6].call(null, value, /*w*/ ctx[12], /*each_value*/ ctx[13], /*w_index*/ ctx[14]);
    	}

    	let waveform_props = { height: "125" };

    	if (/*w*/ ctx[12] !== void 0) {
    		waveform_props.data = /*w*/ ctx[12];
    	}

    	waveform = new Waveform({ props: waveform_props, $$inline: true });
    	binding_callbacks.push(() => bind(waveform, "data", waveform_data_binding));
    	waveform.$on("update", /*wup*/ ctx[4]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			create_component(waveform.$$.fragment);
    			t2 = space();
    			add_location(div0, file$2, 208, 8, 6216);
    			attr_dev(div1, "class", "waveform svelte-gr9nzq");
    			add_location(div1, file$2, 209, 8, 6243);
    			attr_dev(div2, "class", "data svelte-gr9nzq");
    			add_location(div2, file$2, 207, 6, 6189);
    			this.first = div2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(waveform, div1, null);
    			append_dev(div2, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*waveforms*/ 2) && t0_value !== (t0_value = /*w*/ ctx[12].SID + "")) set_data_dev(t0, t0_value);
    			const waveform_changes = {};

    			if (!updating_data && dirty & /*waveforms*/ 2) {
    				updating_data = true;
    				waveform_changes.data = /*w*/ ctx[12];
    				add_flush_callback(() => updating_data = false);
    			}

    			waveform.$set(waveform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(waveform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(waveform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(waveform);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(207:4) {#each waveforms as w (w.SID) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let div0;
    	let map;
    	let t;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let current;
    	let map_props = { options: /*options*/ ctx[2] };
    	map = new Leaflet({ props: map_props, $$inline: true });
    	/*map_binding*/ ctx[5](map);
    	map.$on("ready", /*init*/ ctx[3]);
    	let each_value = /*waveforms*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*w*/ ctx[12].SID;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(map.$$.fragment);
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div0, "class", "map svelte-gr9nzq");
    			add_location(div0, file$2, 201, 2, 6054);
    			add_location(div1, file$2, 205, 2, 6141);
    			attr_dev(main, "class", "svelte-gr9nzq");
    			add_location(main, file$2, 199, 0, 6044);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(map, div0, null);
    			append_dev(main, t);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const map_changes = {};
    			map.$set(map_changes);

    			if (dirty & /*waveforms, wup*/ 18) {
    				const each_value = /*waveforms*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div1, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*map_binding*/ ctx[5](null);
    			destroy_component(map);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dist_formula(tp, ts) {
    	return 8 * (ts - tp);
    }

    function parse_geocsv(data) {
    	var lines = data.split("\n");
    	var geo = {};
    	var amp = [];

    	for (var i = 0; i < lines.length; i++) {
    		if (lines[i][0] == "#") {
    			let v = lines[i].split(":");
    			var key = v[0].replace("# ", "");
    			var val = v[1].trim();
    			geo[key] = val;

    			if (key == "sample_count") {
    				geo["npts"] = parseInt(val);
    			} else if (key == "sample_rate_hz") {
    				geo["dt"] = 1 / parseFloat(val);
    			}
    		} else if (lines[i] == "Time, Sample") ; else {
    			// Data
    			let a = parseFloat(lines[i].split(",")[1]);

    			amp.push(a);
    		}
    	}

    	geo["amp"] = amp;
    	return geo;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let options = {
    		mapID: "map",
    		zoom: 7,
    		center: [41.5, -71.5]
    	};

    	let MAP_EL;
    	let waveforms = [];

    	let xdata = {
    		"starttime": "2020-11-08T14:10:00",
    		"endtime": "2020-11-08T14:12:00",
    		"data": [
    			{
    				"net": "IU",
    				"sta": "HRV",
    				"loc": "00",
    				"cha": "BHZ"
    			},
    			{
    				"net": "N4",
    				"sta": "M63A",
    				"loc": "00",
    				"cha": "HHZ"
    			},
    			{
    				"net": "TA",
    				"sta": "M65A",
    				"loc": "--",
    				"cha": "BHZ"
    			}
    		]
    	};

    	let data = [
    		{
    			"key": "IU_HRV_00_BHZ",
    			"lat": 42.5064,
    			"lon": -71.5583,
    			"file": "IU.HRV.00.BHZ.M.2020.313.141006.sac",
    			"r": 100 * 1000
    		},
    		{
    			"key": "N4_M63A_00_HHZ",
    			"lat": 41.4038,
    			"lon": -72.0464,
    			"file": "N4.M63A.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "TA_M65A__BHZ",
    			"lat": 41.562,
    			"lon": -70.6466,
    			"file": "TA.M65A..BHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "LD.KSCT.BHZ",
    			"lat": 41.7261,
    			"lon": -73.4843,
    			"file": "LD.KSCT..BHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "LD.UCCT.BHZ",
    			"lat": 41.7943,
    			"lon": -72.2255,
    			"file": "LD.UCCT..BHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "LD.UNH.BHZ",
    			"lat": 43.0927,
    			"lon": -70.865,
    			"file": "LD.UNH..BHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "N4.K62A.HHZ",
    			"lat": 42.6651,
    			"lon": -72.2345,
    			"file": "N4.K62A.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "N4.L61B.HHZ",
    			"lat": 42.4498,
    			"lon": -72.6802,
    			"file": "N4.L61B.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "N4.L64A.HHZ",
    			"lat": 41.9359,
    			"lon": -70.8391,
    			"file": "N4.L64A.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "N4.N62A.HHZ",
    			"lat": 40.9313,
    			"lon": -73.4677,
    			"file": "N4.N62A.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "NE.BCX.HHZ",
    			"lat": 42.335,
    			"lon": -71.1705,
    			"file": "NE.BCX.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "NE.WES.HHZ",
    			"lat": 42.3848,
    			"lon": -71.3218,
    			"file": "NE.WES.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		},
    		{
    			"key": "NE.WSPT.HHZ",
    			"lat": 41.1712,
    			"lon": -73.3278,
    			"file": "NE.WSPT.00.HHZ.M.2020.313.141006.sac",
    			"r": 0
    		}
    	];

    	async function init() {
    		let marker = data.map(x => {
    			return {
    				lat: x.lat,
    				lng: x.lon,
    				icon: {
    					iconUrl: "./marker-icon-2x-red.png",
    					iconSize: [12.5, 20.5]
    				},
    				popup: { isOpen: false, text: x.key }
    			};
    		});

    		let circles = data.map(x => {
    			return {
    				lat: x.lat,
    				lng: x.lon,
    				r: x.r,
    				key: x.key,
    				options: { fill: false, color: "red" }
    			};
    		});

    		MAP_EL.updateMarkers({ markers: marker, circles });

    		MAP_EL.on("mousedown", function (ev) {
    			//document.querySelector('#map').on('mousedown', function(ev) {
    			console.log("MOUSE MAP MOVE", ev.latlng);
    		});

    		xdata.data.map(x => {
    			//let x = xdata.data[2];
    			var url = "https://service.iris.edu/fdsnws/dataselect/1/query?";

    			if (x.net != "") {
    				url += `net=${x.net}&`;
    			}

    			if (x.sta != "") {
    				url += `sta=${x.sta}&`;
    			}

    			if (x.loc != "") {
    				url += `loc=${x.loc}&`;
    			}

    			if (x.cha != "") {
    				url += `cha=${x.cha}&`;
    			}

    			url += `starttime=${xdata.starttime}&`;
    			url += `endtime=${xdata.endtime}&`;
    			url += "format=geocsv.inline&nodata=404";
    		}); //console.log(url);
    		/*
      fetch(url)
      .then((data) => data.text())
      .then((data) => parse_geocsv(data))
      .then((data) => {
      console.log(data.sid);
      waveforms = [...waveforms, data];
      });
    */

    		xdata.data.forEach(x => {
    			let file = `${x.net}_${x.sta}_${x.loc}_${x.cha}.csv`;
    			file = file.replace("--", "");

    			//console.log(file);
    			fetch(file).then(data => data.text()).then(data => parse_geocsv(data)).then(data => {
    				data.tp = 20;
    				data.ts = 40;
    				let stat = get_stat(data.SID);

    				//console.log(data.SID, stat);
    				if (stat !== undefined) {
    					stat.r = dist_formula(data.tp, data.ts) * 1000;
    					update(stat);
    				}

    				$$invalidate(1, waveforms = [...waveforms, data]);
    			}); //return data;
    		});
    	}

    	function update(stat) {
    		//console.log(stat);
    		MAP_EL.updateMarkers({ circles: [stat] });
    	}

    	function get_stat(sid) {
    		return data.find(v => v.key === sid);
    	}

    	function set_dist(sid, dist) {
    		let v = get_stat(sid);

    		if (v !== undefined) {
    			v.r = dist;
    		}
    	}

    	function wup(ev) {
    		let tp = ev.detail.tp;
    		let ts = ev.detail.ts;
    		var stat = get_stat(ev.detail.sid);

    		//console.log(ev.detail.sid, stat);
    		if (stat !== undefined) {
    			stat.r = dist_formula(tp, ts) * 1000;
    			update(stat);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function map_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			MAP_EL = $$value;
    			$$invalidate(0, MAP_EL);
    		});
    	}

    	function waveform_data_binding(value, w, each_value, w_index) {
    		each_value[w_index] = value;
    		$$invalidate(1, waveforms);
    	}

    	$$self.$capture_state = () => ({
    		Map: Leaflet,
    		Waveform,
    		options,
    		MAP_EL,
    		waveforms,
    		xdata,
    		data,
    		dist_formula,
    		init,
    		parse_geocsv,
    		update,
    		get_stat,
    		set_dist,
    		wup
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(2, options = $$props.options);
    		if ("MAP_EL" in $$props) $$invalidate(0, MAP_EL = $$props.MAP_EL);
    		if ("waveforms" in $$props) $$invalidate(1, waveforms = $$props.waveforms);
    		if ("xdata" in $$props) xdata = $$props.xdata;
    		if ("data" in $$props) data = $$props.data;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [MAP_EL, waveforms, options, init, wup, map_binding, waveform_data_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
