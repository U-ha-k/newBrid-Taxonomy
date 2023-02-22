const options = {
    plugins: {
        colors: {
        enabled: false
        }
    }
    };
    
    var ctx = document.getElementById('myChart');
    var chart;
    
    
    const btns = document.querySelectorAll('.btns button')
    const txtOfTax = document.querySelector('.text_of_tax')
    const createList = document.querySelector('.create_list')
    const pinnedElem = document.querySelector('ul.pinned')
    
    var arr = [];
    var TAX = [];
    var CATE = [];
    var ORD = [];
    var GROUP = [];
    var FAM = [];
    var SCI = [];
    var CODE = [];
    var PRI = [];

    var labels;
    var lastTab = 0; //Checking if current page is Birds to call reset when space is pressed


    var pinned = {}
    const columnToButtons = ["ORDER1", "FAMILY", 'SPECIES_GROUP', 'PRIMARY_COM_NAME']
    const buttonTexts = ['ORDER', 'FAMILY', 'SPECIES GROUP', 'BIRD NAME']
    const columnsToText = {
    "ORDER1": "ORDER",
     "FAMILY": "FAMILY", 
     'SPECIES_GROUP': "SPECIES GROUP", 
    'PRIMARY_COM_NAME': "BIRD NAME"
    }
    const reverseMappings = [{}, {}, {}, {}]
    
    
    // Get data from json
    fetch("./ebird_taxonomy_v2022.json")
    .then(response => {
        return response.json();
    })
    .then(jsondata => {
        arr = jsondata;
        
        jsondata.forEach (d => {
            for (btn in btns) {
                if (btn > 0) {
                    const col = columnToButtons[btn]
                    const parentCol = columnToButtons[btn - 1]
                    reverseMappings[btn][d[col]] = d[parentCol]
                }
            }
        })
    
        for (let i = 0; i < arr.length; i++) {
            ORD.push(arr[i].ORDER1)
            FAM.push(arr[i].FAMILY)
            GROUP.push(arr[i].SPECIES_GROUP)
            PRI.push(arr[i].PRIMARY_COM_NAME)
        }
    
        // tax (Defining the content)
        txtOfTax.innerHTML = TAX[0] +" ~ "+ TAX[TAX.length - 1]
    
    
        // let arrs = [TAX, CATE, ORD, GROUP, FAM, SCI, CODE, PRI]
        let arrs = [ORD, FAM, GROUP, PRI]
    
        console.log('btns length: ', btns.length);
    
        for (let k = 0; k < btns.length; k++) {
        
            btns[k].addEventListener("click", () => {
                console.log('click');
                var labelName;
                var filters = {}

                /*For keeping button filled when active*/
                switch(btns[k].getAttribute('id')){
                case 'order_btn': 
                        document.getElementById("order_btn").classList.add('active');
                        document.getElementById("fam_btn").classList.remove('active');
                        document.getElementById("spe_btn").classList.remove('active');
                        document.getElementById("pri_btn").classList.remove('active');
                        labelName = 'ORDER1'
                        filters = {}
                        break;
                case 'fam_btn': 
                        document.getElementById("fam_btn").classList.add('active');
                        document.getElementById("order_btn").classList.remove('active');
                        document.getElementById("spe_btn").classList.remove('active');
                        document.getElementById("pri_btn").classList.remove('active');
                        labelName = 'FAMILY'
                        filters = {'ORDER1': [pinned['ORDER1']] }
                        break;
                case 'spe_btn': 
                        document.getElementById("spe_btn").classList.add('active');
                        document.getElementById("fam_btn").classList.remove('active');
                        document.getElementById("order_btn").classList.remove('active');
                        document.getElementById("pri_btn").classList.remove('active');
                        labelName = 'SPECIES_GROUP'
                        filters = {
                            'ORDER1': [pinned['ORDER1']],
                            'FAMILY': [pinned['FAMILY']]
                        }
                        break;
                case 'pri_btn': 
                        document.getElementById("pri_btn").classList.add('active');
                        document.getElementById("fam_btn").classList.remove('active');
                        document.getElementById("order_btn").classList.remove('active');
                        document.getElementById("spe_btn").classList.remove('active');
                        labelName = 'PRIMARY_COM_NAME'
                        filters = {
                            'ORDER1': [pinned['ORDER1']], 
                            'SPECIES_GROUP': [pinned['SPECIES_GROUP']],
                            'PRIMARY_COM_NAME': [pinned['PRIMARY_COM_NAME']]
                        }
                        break;
                case ' ': console.log('SPACE');
                        break;
                }
                for (filter in filters) {
                    filters[filter] = filters[filter].filter(name => name !== undefined) 
                    if (filters[filter].length == 0) {
                        delete filters[filter]
                    }
                }
                
                
                // let set1 = new Set(arrs[k])
                // /*All the data within that category*/
                // const nSet = [...set1]
                // console.log('nSet: ', nSet);
                if (chart !== undefined) {
                    chart.destroy();
                    console.log('destroying chart');
                }

                /*filtering data*/
                const filtered = []
                jsondata.forEach(d => {
                    var isFiltered = Object.keys(filters).every(f => 
                        filters[f].includes(d[f])
                    );
                    if (isFiltered) {
                        filtered.push(d)
                    }
                });
                if (k < 3) {
                /*displaying donut charts*/
                txtOfTax.style.display = "none"
                createList.style.display = "none"
               
                /*removing duplicates*/
                /*result = quantity of unique elements in category*/
                chart = drawChart(filtered, labelName)
    
                createList.style.display = "none"

                /***START: Arrow Keys to parse through chart elements***/
                const myChart = Chart.getChart("myChart"); // make sure to replace the "myChart"
                var active_element;

                document.addEventListener('keydown', event => {
                 
                    active_element = myChart.getActiveElements();
                    if ( ! active_element.length ) { 
                        myChart.setActiveElements([{ datasetIndex: 0, index: 0 }]);
                        myChart.tooltip.setActiveElements([{ datasetIndex: 0, index: 0 }]);
                        myChart.update();
                        active_element = myChart.getActiveElements();
                    }

                    const active = active_element[0];
                    const dataset = myChart.data.datasets[active.datasetIndex];
                    const data = dataset.data;
                    let index = active.index;

                    /*Arrow Left and Right listeners*/
                    if (event.code === 'ArrowLeft' ) {
                        index = index > 0 ? index - 1 : data.length - 1;
                        arrowClicked = true;
                    } else if ( event.code === 'ArrowRight' ) {
                        index = index < data.length - 1 ? index + 1 : 0;
                        arrowClicked = true;
                    }
                    console.log('active', active.datasetIndex);
                    console.log('index ', index);
                    myChart.setActiveElements([{ datasetIndex: active.datasetIndex, index }]);
                    myChart.tooltip.setActiveElements([{ datasetIndex: active.datasetIndex, index }]);
                    myChart.update();
                    

                    
                    /*If 'Space' is clicked over a section, select it*/
                    if(event.code === 'Space'){
                        console.log('Space is clicked on chart');
                        const label = labels[active_element[0].index];
                        console.log("%s pinned to %s", labelName, label);

                        pinned[labelName] = label
                        for (let i = columnToButtons.indexOf(labelName) + 1; i < columnToButtons.length; i++) {
                            delete pinned[columnToButtons[i]]
                        }
                        var col = label
                        for (let i = columnToButtons.indexOf(labelName); i >= 0; i--) {
                            col = reverseMappings[i][col]
                            pinned[columnToButtons[i - 1]] = col
                        }

                        updatePinnedHtml(filtered)

                        switch(labelName){
                            case "ORDER1": document.getElementById("order_btn").disabled = true;
                                        document.getElementById('order_btn').classList.add('not-allowed');
                                        document.getElementById("fam_btn").click();
                                        break;
                            case "FAMILY": document.getElementById("fam_btn").disabled = true;
                                        document.getElementById('fam_btn').classList.add('not-allowed');
                                        document.getElementById("order_btn").disabled = true;
                                        document.getElementById('order_btn').classList.add('not-allowed');
                                        document.getElementById("spe_btn").click();
                                        break;
                            case "SPECIES_GROUP": document.getElementById("spe_btn").disabled = true;
                                                document.getElementById('spe_btn').classList.add('not-allowed');
                                                document.getElementById("fam_btn").disabled = true;
                                                document.getElementById('fam_btn').classList.add('not-allowed');
                                                document.getElementById("order_btn").disabled = true;
                                                document.getElementById('order_btn').classList.add('not-allowed');
                                                document.getElementById("pri_btn").click();
                                                break;
                        }

                    }


                });
                /***END: Arrow Keys to parse through chart elements***/

                } else {
                    /*last 3 lists (sciname, species code, primary name*/
                    txtOfTax.style.display = "none"
                    showList(filtered);
                    lastTab++;
                  }
            })
        }
    
    /*
     "TAXON_ORDER": 2,
    "CATEGORY": "species",
    "ORDER1": "Passeriformes",
    "SPECIES_GROUP": "Ostriches",
    "FAMILY": "Struthionidae (Ostriches)",
    "SCI_NAME": "Struthio camelus",
    "SPECIES_CODE": "ostric2",
    "PRIMARY_COM_NAME": "Common Ostrich"
    */
        /*for "BIRDS" list in 4th button*/
        function showList(data) {
            createList.style.display = "block";
            createList.classList.add("fontClass");
            var inHTML= ["<table>", "<tr>", "<th>Order</th>", "<th>Family</th>", , "<th>Species Group</th>", "<th>Bird</th>", "</tr>"]
            for(let l = 0; l < data.length; l++){
                inHTML.push("<tr>")
                inHTML.push(...["<td>", data[l]['ORDER1'], "</td>"])
                inHTML.push(...["<td>", data[l]['FAMILY'], "</td>"])
                inHTML.push(...["<td>", data[l]['SPECIES_GROUP'], "</td>"])
                inHTML.push(...["<td>", data[l]['PRIMARY_COM_NAME'], "</td>"])
                inHTML.push("</tr>")
  
            }
            inHTML.push("</table>")
            createList.innerHTML = inHTML.join(" ");
        }

        function count(data, col) {
            const counts = {}
            data.forEach(d => {
                if (d[col] in counts) {
                    counts[d[col]] += 1
                } else {
                    counts[d[col]] = 1
                }
            });
            return counts
        }

        function updatePinnedHtml(data) {
           
            pinnedElem.innerHTML = ''
            
            for (idx in columnToButtons) {
                const p = columnToButtons[idx]

                if (p in pinned) {
                    const elem = document.createElement("li");
                    elem.classList.add("fontClass");
                    elem.textContent = columnsToText[p].toString() + ": " + pinned[p].toString();
                    //elem.appendChild(del)
                    pinnedElem.appendChild(elem) 

                    /*adding total number in button label*/
                    for (btn in btns) {
                        const size = Object.keys(count(data, columnToButtons[btn])).length
                        btns[btn].textContent = buttonTexts[btn] + "(" + size.toString() + ")"
                    }   
                }
            }
        }
    
        //filters {'ORDER1': ["SOME NAME"]}
        function drawChart(filtered, labelCol) {
          
            labels = filtered.map(d => d[labelCol]);
            const counts = count(filtered, labelCol)
            labels = [... new Set(labels)]
            const datas = labels.map(l => counts[l]);
            console.log("processed");
            return new Chart(ctx, {
                type: 'pie',
                data: {
                labels: labels,
                datasets: [{
                    label: 'of Numbers',
                    data: datas,
                    backgroundColor: ["#324851", "#86ac41", "#34675c", "#72a3A1", "#2e4600", "#486b00", "#8d230f", "#c99e10"],
                    borderWidth: 2
                }, ]
                },
                options: {
                    cutout: '40%',
                    plugins: {
                        legend: {
                        display: false
                        }
                    },
                    onClick: (evt, activeEls) => {
                        
                        const label = labels[activeEls[0].index];
                        console.log("%s pinned to %s", labelCol, label);
                        // console.log("labels[]: ", labels);
                        // console.log("activeEls[0]: ", activeEls[0]);
                        // console.log("activeEls[0].index: ", activeEls[0].index);
                        
                        pinned[labelCol] = label
                        for (let i = columnToButtons.indexOf(labelCol) + 1; i < columnToButtons.length; i++) {
                            delete pinned[columnToButtons[i]]
                        }
                        var col = label
                        for (let i = columnToButtons.indexOf(labelCol); i >= 0; i--) {
                            col = reverseMappings[i][col]
                            pinned[columnToButtons[i - 1]] = col
                        }

                        updatePinnedHtml(filtered)

                        switch(labelCol){
                            case "ORDER1": document.getElementById("order_btn").disabled = true;
                                        document.getElementById('order_btn').classList.add('not-allowed');
                                        document.getElementById("fam_btn").click();
                                        break;
                            case "FAMILY": document.getElementById("fam_btn").disabled = true;
                                        document.getElementById('fam_btn').classList.add('not-allowed');
                                        document.getElementById("order_btn").disabled = true;
                                        document.getElementById('order_btn').classList.add('not-allowed');
                                        document.getElementById("spe_btn").click();
                                        break;
                            case "SPECIES_GROUP": document.getElementById("spe_btn").disabled = true;
                                                document.getElementById('spe_btn').classList.add('not-allowed');
                                                document.getElementById("fam_btn").disabled = true;
                                                document.getElementById('fam_btn').classList.add('not-allowed');
                                                document.getElementById("order_btn").disabled = true;
                                                document.getElementById('order_btn').classList.add('not-allowed');
                                                document.getElementById("pri_btn").click();
                                                break;
                        }
                        
                        
                    }
                }
            });
            // ctx.onclick = function(evt, activeEls) {
            //     const pos = Chart.helpers.getRelativePosition(evt, chart);
            //     const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
            //     const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
            //     console.log(dataX);
            //     console.log(dataY);
            // }
            //return chart
            
        }
    });
    
    /*Listening for keyboard clicks*/
    document.addEventListener('keypress', (event)=> {
        // console.log(event); // all event related info
        // console.log(event.type);
        console.log(event.key);
        // console.log(event.code);
    
        var expr = event.key;
    
        switch (expr) {
        case 'a': console.log('LETTER A');
                    document.getElementById("order_btn").click();
                    break;
        case 'd': console.log('LETTER D');
                    document.getElementById("fam_btn").click();
                    break;
        case 'w': console.log('LETTER W');
                    document.getElementById("spe_btn").click();
                    break;
        case 's': console.log('LETTER S');
                    document.getElementById("pri_btn").click();
                    break;
        case ' ': console.log('SPACE');
                  if(lastTab == 1){
                    console.log('last tab is 1');
                    lastTab++;
                  }else if(lastTab == 2){
                    console.log('last tab is 2');
                    reset();
                  }
                  
                  break;
        case 'ArrowLeft': console.log('ARROW LEFT');
                          //console.log('chart: ', chart);
                    break;
        case 'ArrowRight': console.log('ARROW RIGHT');
                    break;
        }
    
    });

    var pressTimer;

    $(" ").keyup(function(){
    clearTimeout(pressTimer);
    // Clear timeout
    return false;
    }).keydown(function(){
    // Set timeout
    pressTimer = window.setTimeout(function() { 
        console.log('long press');
        },1000);
    return false; 
    });


    /*resetting everything*/
    function reset(){
        /*delete pinned filters*/
        pinned = {};
        pinnedElem.innerHTML = "";

        /*destroy chart*/
        chart.destroy();

        /*resetting button names*/
        for (var i = 0; i < btns.length; i++){
            switch(i){
                case 0: btns[i].textContent = "ORDER";
                        break;
                case 1: btns[i].textContent = "FAMILY";
                        break;
                case 2: btns[i].textContent = "SPECIES GROUP";
                        break;
                case 3: btns[i].textContent = "BIRD NAME";
                        break;
            }
            btns[i].disabled = false;
            btns[i].classList.remove('not-allowed');
        }
        lastTab = 0;
        /*clicking back order button*/
        document.getElementById("order_btn").click();
    }