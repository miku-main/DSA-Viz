/**
 * Binary Search Tree - event emitting, UI-agnostic
 * 
 * Tree snapshot format (pure JSON so we can pass in/out):
 * {
 *  rootId: number|null,
 *  nodes: Array<{ id, key, left: number|null, right: number|null, parent: number|null }>
 * }
 * 
 * Events emit:
 * - init:  { tree }
 * - setCurrent:    { id } // focus current node
 * - compareNode:   { id, key } // compare key vs node.key
 * - insertNode:    { id, key, parentId, side, tree } // new node placed; includes full tree snapshot
 * - found: { id, key }
 * - notFound:  { key }
 * - clear: {}
 * - error: { message }
 */

function cloneTree(tree) {
    if (!tree) return { rootId: null, nodes: [] };
    return {
        rootId: tree.rootId ?? null,
        nodes: (tree.nodes ?? []).map(n => ({ id: n.id, key: n.key, left: n.left ?? null, right: n.right ?? null, parent: n.parent ?? null })),
    };
}

function toMap(tree) {
    const map = new Map();
    for (const n of tree.nodes) map.set(n.id, n);
    return map;
}

function nextId(tree) {
    return tree.nodes.length ? Math.max(...tree.nodes.map(n => n.id)) + 1 : 0;
}

export function bstInit(tree) {
    const t = cloneTree(tree);
    return [{ t: 0, type: 'init', payload: { tree: t, line: 2 } }];
}

/**
 * Insert a key into the BST
 * - Allows duplicates by going RIGHT (common, keeps it simple).
 */

export function bstInsertOp(tree, rawKey) {
    const key = Number(rawKey);
    if (Number.isNaN(key)) {
        return [{ t: 0, type: 'error', payload: { message: 'Enter a number to insert.'} }];
    }

    const t0 = cloneTree(tree);
    const events = [];
    let tick = 0;

    if (t0.rootId == null) {
        const id = nextId(t0);
        const node = { id, key, left: null, right: null, parent: null };
        t0.nodes.push(node);
        t0.rootId = id;
        events.push({ t: tick++, type: 'insertNode', payload: { id, key, parentId: null, side: null, tree: cloneTree(t0), line: 10 } });
        events.push({ t: tick++, type: 'clear', payload: {} });
        return events;
    }

    const map = toMap(t0);
    let curId = t0.rootId;
    let parentId = null;
    let side = null;

    while (curId != null) {
        events.push({ t: tick++, type: 'setCurrent', payload: { id: curId, line: 6 } });
        const cur = map.get(curId);
        events.push({ t: tick++, type: 'compareNode', payload: { id: curId, key, line: 7 } });

        if (key < cur.key) {
            parentId = curId; side = 'L';
            if (cur.left == null) break;
            curId = cur.left;
        } else {    // key >= cur.key goes right
            parentId = curId, side = 'R';
            if (cur.right == null) break;
            curId = cur.right;
        }
    }

    const id = nextId(t0);
    const node = { id, key, left: null, right: null, parent: parentId };
    t0.nodes.push(node);
    const parent = t0.nodes.find(n => n.id === parentId);
    if (side === 'L') parent.left = id; else parent.right = id;

    events.push({ t: tick++, type: 'inserNode', payload: { id, key, parentId, side, tree: cloneTree(t0), line: 10 } });
    events.push({ t: tick++, type: 'clear', payload: {} });
    return events;
}

/**
 * Search for a key.
 */

export function bstSearchOp(tree, rawKey) {
    const key = Number(rawKey);
    if (Number.isNaN(key)) {
        return [{ t: 0, type: 'error', payload: { message: 'Enter a number to search.'} }];
    }

    const t0 = cloneTree(tree);
    const events = [];
    let tick = 0;

    if (t0.rootId == null) {
        return [{ t: 0, type: 'notFound', payload: { key, line: 13 } }];
    }

    const map = toMap(t0);
    let curId = t0.rootId;

    while (curId != null) {
        events.push({ t: tick++, type: 'setCurrent', payload: { id: curId, line: 6 } });
        const cur = map.get(curId);
        events.push({ t: tick++, type: 'compareNode', payload: { id: curId, key, line: 7 } });

        if (key === cur.key) {
            events.push({ t: tick++, type: 'found', payload: { id: curId, key, line: 8 } });
            events.push({ t: tick++, type: 'clear', payload: {} });
            return events;
        }

        curId = (key < cur.key) ? cur.left : cur.right;
    }

    events.push({ t: tick++, type: 'notFound', payload: { key, line: 13 } });
    events.push({ t: tick++, type: 'clear', payload: {} });
    return events;
}