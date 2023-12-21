

/**
 * Algorithm:
 * For every face, we compute the elements which are dominating the face.
 * If the number of these elements is < than the number of elements, then this face is not in Sigma(R).
 * @param delta 
 * @param elts 
 * @param rep 
 * @returns 
 */
export function checkInclusion(delta: Array<Set<number>>, elts: Set<number>, rep: Array<Array<number>>): undefined | [number, number]{
    const n = rep[0].length;
    const d = rep.length;
    for (const [index, face] of delta.entries()){
        const dominatingElts = new Set();
        for (let i = 0 ; i < d ; i ++){
            for (let j = n-1 ; j >= 0 ; j --){
                dominatingElts.add(rep[i][j]);
                if (face.has(rep[i][j])) break;
            }
        }
        if (dominatingElts.size < n) {
            for (let j = 0 ; j < n ; j ++){
                if (dominatingElts.has(rep[0][j]) == false){
                    return [index, rep[0][j]];
                }
            }
        }
    }
    return undefined;
}


function auxDM(delta: Array<Set<number>>, insertedElts: Set<number>, todo: Array<number>, d: number, rep: Array<Array<number>>): undefined | Array<Array<number>> {
    const v = todo.pop();
    if (typeof v == "undefined"){
        // Finito: a representation has been found
        // console.log(rep);   
        return rep;
    }
    
    insertedElts.add(v);
    // Insert v at the beggining of each order
    for (let i = 0 ; i < d ; i ++){
        rep[i].unshift(v);
    }

    const m = rep[d-1].length;
    const pos = new Array<number>(d).fill(0);

    while(true){

        // Check if delta is included in the Sigma(R)
        const r = checkInclusion(delta, insertedElts, rep);

        if (typeof r == "undefined"){
            const result = auxDM(delta, insertedElts, todo, d, rep);
            if (typeof result != "undefined"){
                return result;
                // Clean
                // insertedElts.delete(v);
                // for (let i = 0 ; i < d ; i ++){
                //     rep[i].splice(pos[i], 1);
                // }
                // todo.push(v);
                
            }

            let isMaximal = true;
            for (let i = d-1; i >= 0 ; i --){
                if (pos[i] == m-1){
                    moveLeft(rep[i], pos[i], 0);
                    pos[i] = 0;
                } else {
                    moveRight(rep[i], pos[i], pos[i]+1);
                    pos[i] ++;
                    isMaximal = false;
                    break;
                }
            }
            if (isMaximal){
                // Clean
                insertedElts.delete(v);
                for (let i = 0 ; i < d ; i ++){
                    rep[i].splice(pos[i], 1);
                }
                todo.push(v);
                return undefined;
            }

        } else {
            const [faceIndex, nonDominatingElt] = r;
            const face = delta[faceIndex];
            
            if (v == nonDominatingElt){
                // Move right v just after the max element of face in rep[d-1]
                for (let i = m-1 ; i >= 0 ; i --){
                    if (face.has(rep[d-1][i])){
                        moveRight(rep[d-1], pos[d-1], i);
                        pos[d-1] = i;
                        break;
                    }
                }
            } else {
                // Compute the last order where y < v (y = nonDominatingElt)
                let i = d-1
                while (i >= 0){
                    const j = rep[i].indexOf(nonDominatingElt);
                    if (j < pos[i]){
                        break;
                    }
                    i --;
                }

                let isMaximal = true;
                for (let j = i-1 ; j >= 0 ; j --){
                    if (pos[j] < m-1){
                        moveRight(rep[j], pos[j], pos[j]+1);
                        pos[j]++;
                        isMaximal = false;
                        break;
                    } else {
                        moveLeft(rep[j], pos[j], 0);
                        pos[j] = 0;
                    }
                }
                if (isMaximal){
                    // Clean
                    insertedElts.delete(v);
                    for (let j = 0 ; j < d ; j ++){
                        rep[j].splice(pos[j], 1);
                    }
                    todo.push(v);
                    return undefined;
                }
                // Else 
                for (let j = i ; j < d ; j ++){
                    moveLeft(rep[j], pos[j], 0);
                    pos[j] = 0;
                }
                
            }
        }
    }
}

export function dushnikMillerDim(faces: Array<Array<number>>, d: number): undefined | Array<Array<number>>{

    const delta = faces.map(v => new Set(v));


    const vertices = new Set<number>();
    for (const face of delta){
        for (const elt of face){
            vertices.add(elt);
        }
    }

    // Initialize the representation
    const rep = new Array<Array<number>>();
    for (let i = 0 ; i < d ; i++){
        rep.push(new Array<number>());
    }

    const insertedElts = new Set<number>();
    const todo = Array.from(vertices);

    return auxDM(delta, insertedElts, todo, d, rep);
}


export function moveRight(t: Array<number>, i: number, j: number){
    const x = t[i];
    for (let k = i+1; k <= j ; k ++){
        t[k-1] = t[k];
    }
    t[j] = x;
}

export function moveLeft(t: Array<number>, i: number, j: number){
    const x = t[i];
    for (let k = i-1; k >= j ; k --){
        t[k+1] = t[k];
    }
    t[j] = x;
}



function measure(faces: Array<Array<number>>,d : number){
    console.time("DM");
    console.log(dushnikMillerDim(faces, d));
    console.timeEnd("DM")
}

// measure([[1,2,3],[1,2,4],[1,3,5],[2,3,5]], 4); // 9ms
// measure([[1,2,3],[1,2,4],[1,3,5],[2,3,5],[2,4,5],[3,4,5]], 4); // 2ms
// measure([[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5]], 3); // 35ms
// measure([[1,2,3],[1,2,4],[2,3,5],[1,3,6]], 4); // 0.3ms
// measure([[1,2,3],[2,3,4],[3,4,5],[4,5,6],[5,6,7],[6,7,8],[1,3,5],[3,5,7],[2,4,6],[4,6,8]], 4) // 3ms


