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

    events.push({ t: tick++, type: 'insertNode', payload: { id, key, parentId, side, tree: cloneTree(t0), line: 10 } });
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

export function bstDeleteOp(tree, rawKey) {
    const key = Number(rawKey);
    if (Number.isNaN(key)) {
        return [{ t: 0, type: 'error', payload: { message: 'Enter a number to delete.'} }];
    }

    // Helpers
    const T0 = cloneTree(tree);
    const events = [];
    let t = 0;

    const mapById = (t) => new Map(t.nodes.map(n => [n.id, n]));
    const findMinId = (id, t) => {
        if (id == null) return null;
        const map = mapById(t);
        let cur = id;
        while (map.get(cur)?.left != null) {
            cur = map.get(cur).left;
            events.push({ t: t++, type: 'setCurrent', payload: { id: cur, line: 6 } });
        }
        return cur;
    };
    const relinkParent = (t, parentId, oldChildId, newChildId) => {
        if (parentId == null) {
            t.rootId = newChildId ?? null;
            if (newChildId != null) {
                const child = t.nodes.find(n => n.id === newChildId);
                child.parent = null;
            }
            return;
        }
        const p = t.nodes.find(n => n.id === parentId);
        if (p.left === oldChildId) p.left = newChildId ?? null;
        else if (p.right === oldChildId) p.right = newChildId ?? null;
        if (newChildId != null) {
            const c = t.nodes.find(n => n.id === newChildId);
            c.parent = parentId;
        }
    };

    // !) traverse to find target
    if (T0.rootId == null) {
        return [{ t: 0, type: 'notFound', payload: { key, line: 13 } }];
    }

    const map0 = mapById(T0);
    let curId = T0.rootId;
    let targetId = null;

    while (curId != null) {
        events.push({ t: t++, type: 'setCurrent', payload: { id: curId, line: 6 } });
        const cur = map0.get(curId);
        events.push({ t: t++, type: 'compareNode', payload: { id: curId, key, line: 7 } });
        if (key === cur.key) { targetId = curId; break; }
        curId = key < cur.key ? cur.left : cur.right;
    }

    if (targetId == null) {
        events.push({ t: t++, type: 'notFound', payload: { key, line: 13 } });
        events.push({ t: t++, type: 'clear', payload: {} });
        return events;
    }

    events.push({ t: t++, type: 'found', payload: { id: targetId, key, line: 8 } });
    events.push({ t: t++, type: 'nodeDeleteTarget', payload: { id: targetId } });

    // 2) Perform deletion on a working copy T
    const T = cloneTree(T0);
    const map = mapById(T);
    const z = map.get(targetId);
    const left = z.left, right = z.right;

    // Case A: 0 or 1 child -> simple unlink/relink
    if (left == null || right == null) {
        const child  = (left != null) ? left : right; // may be null (leaf)
        relinkParent(T, z.parent, z.id, child);
        // remove z node from array
        T.nodes = T.nodes.filter(n => n.id !== z.id);
        events.push({ t: t++, type: 'updateTree', payload: { tree: cloneTree(T) } });
        events.push({ t: t++, type: 'clear', payload: {} });
        return events;
    }

    // Case B: 2 child -> find successor, copy key, then delete successor
    // 2.1) locate successor (min in right subtree)
    let succId = right;
    events.push({ t: t++, type: 'setCurrent', payload: { id: succId, line: 6 } });
    succId = findMinId(succId, T);
    events.push({ t: t++, type: 'markSuccessor', payload: { id: succId } });

    const succ = map.get(succId);
    // 2.2) replace target's key with successor's key (structure unchanged)
    z.key = succ.key;
    events.push({ t: t++, type: 'replaceKey', payload: { id: z.id, newKey: z.key, tree: cloneTree(T) } });

    // 2.3) delete successor node (succ has no left; may have right)
    const succChild = succ.right ?? null;
    relinkParent(T, succ.parent, succ.id, succChild) ;
    T.nodes = T.nodes.filter(n => n.id !== succ.id);

    events.push({ t: t++, type: 'updateTree', payload: { tree: cloneTree(T) } });
    events.push({ t: t++, type: 'clear', payload: {} });
    return events;
}