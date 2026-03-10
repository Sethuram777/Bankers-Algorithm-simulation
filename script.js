
    // ========== EXISTING BANKER'S ALGORITHM FUNCTIONS (UNCHANGED) ==========

    function createMatrixInput(matrixType) {
        const processes = parseInt(document.getElementById('processes').value);
        const resources = parseInt(document.getElementById('resources').value);

        const matrixTable = document.getElementById(matrixType + 'Matrix');
        matrixTable.innerHTML = '';

        for (let i = 0; i < processes; i++) {
            const row = matrixTable.insertRow(-1);

            for (let j = 0; j < resources; j++) {
                const cell = row.insertCell(-1);
                const input = document.createElement('input');
                input.type = 'text';
                input.name = `${matrixType}[${i}][${j}]`;
                cell.appendChild(input);
            }
        }
    }

    function createAvailableResourcesInput() {
        const resources = parseInt(document.getElementById('resources').value);

        const availableTable = document.getElementById('availableResources');
        availableTable.innerHTML = '<tr><td>Available Resources:</td></tr>';

        const row = availableTable.insertRow(-1);

        for (let i = 0; i < resources; i++) {
            const cell = row.insertCell(-1);
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `available[${i}]`;
            input.placeholder = `Available ${i + 1}`;
            cell.appendChild(input);
        }
    }

    function runBankersAlgorithm() {
		const processes = parseInt(document.getElementById('processes').value);
		const resources = parseInt(document.getElementById('resources').value);
	
		const allocation = [];
		const maximum = [];
		const available = [];
	
		for (let i = 0; i < processes; i++) {
			allocation[i] = [];
			maximum[i] = [];
			for (let j = 0; j < resources; j++) {
				allocation[i][j] = parseInt(document.querySelector(`input[name="allocation[${i}][${j}]"]`).value);
				maximum[i][j] = parseInt(document.querySelector(`input[name="maximum[${i}][${j}]"]`).value);
			}
		}
	
		for (let i = 0; i < resources; i++) {
			available[i] = parseInt(document.querySelector(`input[name="available[${i}]"]`).value);
		}
	
		const work = [...available];
		const finish = new Array(processes).fill(false);
		const safeSequence = [];
		let isSafe = true;
	
		let found;
		do {
			found = false;
			for (let i = 0; i < processes; i++) {
				if (!finish[i]) {
					let canExecute = true;
					for (let j = 0; j < resources; j++) {
						if (maximum[i][j] - allocation[i][j] > work[j]) {
							canExecute = false;
							break;
						}
					}
	
					if (canExecute) {
						for (let j = 0; j < resources; j++) {
							work[j] += allocation[i][j];
						}
						finish[i] = true;
						safeSequence.push(i);
						found = true;
					}
				}
			}
		} while (found);
	
		for (let i = 0; i < processes; i++) {
			if (!finish[i]) {
				isSafe = false;
				break;
			}
		}
	
		const resultDiv = document.getElementById('result');
		if (isSafe) {
			const safeSequenceString = safeSequence.map(p => `P${p}`).join(" → ");
			resultDiv.innerHTML = `
				<div class="status-badge safe">✓ SAFE STATE</div>
				<p><strong>Safe Sequence:</strong> ${safeSequenceString}</p>
				<p>System is in a safe state and can safely allocate resources.</p>
			`;
			resultDiv.classList.add('show', 'safe');
			resultDiv.classList.remove('unsafe');
		} else {
			resultDiv.innerHTML = `
				<div class="status-badge unsafe">✗ UNSAFE STATE</div>
				<p>No safe sequence exists.</p>
				<p>System is not in a safe state. Deadlock may occur.</p>
			`;
			resultDiv.classList.add('show', 'unsafe');
			resultDiv.classList.remove('safe');
		}
		displayNeedMatrix(allocation, maximum);
	}
	
    function displayNeedMatrix(allocation, maximum) {
        const processes = allocation.length;
        const resources = allocation[0].length;

        const needMatrix = [];
        for (let i = 0; i < processes; i++) {
            needMatrix[i] = [];
            for (let j = 0; j < resources; j++) {
                needMatrix[i][j] = maximum[i][j] - allocation[i][j];
            }
        }

        const needMatrixDiv = document.getElementById('needMatrixDiv');
        needMatrixDiv.innerHTML = '<h2>📋 Need Matrix:</h2>';

        const table = document.createElement('table');
        table.className = 'matrix';
        table.id = 'needMatrix';
        needMatrixDiv.appendChild(table);

        // Create table header
        const headerRow = table.insertRow(0);
        const headerCell = headerRow.insertCell(0);
        headerCell.innerHTML = '<b>Process</b>';
        
        for (let j = 0; j < resources; j++) {
            const cell = headerRow.insertCell(j + 1);
            cell.innerHTML = `<b>Resource ${j + 1}</b>`;
        }

        // Populate the table with need matrix values
        for (let i = 0; i < processes; i++) {
            const row = table.insertRow(-1);
            const processCell = row.insertCell(0);
            processCell.innerHTML = `<b>P${i}</b>`;
            
            for (let j = 0; j < resources; j++) {
                const cell = row.insertCell(j + 1);
                cell.innerHTML = needMatrix[i][j];
            }
        }
    }

    // ========== NEW RESOURCE REQUEST FUNCTIONS ==========

    function populateProcessDropdown() {
        const processes = parseInt(document.getElementById('processes').value);
        const dropdown = document.getElementById('requestProcess');
        
        dropdown.innerHTML = '';
        for (let i = 0; i < processes; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = `Process ${i} (P${i})`;
            dropdown.appendChild(option);
        }
    }

    function createResourceRequestInputs() {
        const resources = parseInt(document.getElementById('resources').value);
        const requestResourcesDiv = document.getElementById('requestResourcesInputs');
        
        requestResourcesDiv.innerHTML = '';
        for (let i = 0; i < resources; i++) {
            const group = document.createElement('div');
            group.className = 'resource-input-group';
            
            const label = document.createElement('label');
            label.htmlFor = `requestResource${i}`;
            label.textContent = `Resource ${i + 1}`;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `requestResource${i}`;
            input.name = `requestResource[${i}]`;
            input.value = '0';
            input.min = '0';
            
            group.appendChild(label);
            group.appendChild(input);
            requestResourcesDiv.appendChild(group);
        }
    }

    function submitResourceRequest() {
        const processes = parseInt(document.getElementById('processes').value);
        const resources = parseInt(document.getElementById('resources').value);
        const selectedProcess = parseInt(document.getElementById('requestProcess').value);

        // Get current values
        const allocation = [];
        const maximum = [];
        const available = [];

        for (let i = 0; i < processes; i++) {
            allocation[i] = [];
            maximum[i] = [];
            for (let j = 0; j < resources; j++) {
                allocation[i][j] = parseInt(document.querySelector(`input[name="allocation[${i}][${j}]"]`).value);
                maximum[i][j] = parseInt(document.querySelector(`input[name="maximum[${i}][${j}]"]`).value);
            }
        }

        for (let i = 0; i < resources; i++) {
            available[i] = parseInt(document.querySelector(`input[name="available[${i}]"]`).value);
        }

        // Get requested resources
        const request = [];
        for (let i = 0; i < resources; i++) {
            request[i] = parseInt(document.getElementById(`requestResource${i}`).value);
        }

        // Calculate need
        const need = [];
        for (let i = 0; i < processes; i++) {
            need[i] = [];
            for (let j = 0; j < resources; j++) {
                need[i][j] = maximum[i][j] - allocation[i][j];
            }
        }

        // Check if request <= need
        let checkRequest = true;
        for (let j = 0; j < resources; j++) {
            if (request[j] > need[selectedProcess][j]) {
                checkRequest = false;
                break;
            }
        }

        if (!checkRequest) {
            displayRequestResult(false, "REQUEST EXCEEDS NEED", request, null, null, null, null);
            return;
        }

        // Check if request <= available
        let checkAvailable = true;
        for (let j = 0; j < resources; j++) {
            if (request[j] > available[j]) {
                checkAvailable = false;
                break;
            }
        }

        if (!checkAvailable) {
            displayRequestResult(false, "REQUEST EXCEEDS AVAILABLE", request, null, null, null, null);
            return;
        }

        // Temporarily allocate resources (pretend allocation)
        const tempAllocation = JSON.parse(JSON.stringify(allocation));
        const tempAvailable = [...available];

        for (let j = 0; j < resources; j++) {
            tempAllocation[selectedProcess][j] += request[j];
            tempAvailable[j] -= request[j];
        }

        // Run safety algorithm with temp values
        const work = [...tempAvailable];
        const finish = new Array(processes).fill(false);
        const safeSequence = [];
        let isSafe = true;

        let found;
        do {
            found = false;
            for (let i = 0; i < processes; i++) {
                if (!finish[i]) {
                    let canExecute = true;
                    for (let j = 0; j < resources; j++) {
                        const tempNeed = maximum[i][j] - tempAllocation[i][j];
                        if (tempNeed > work[j]) {
                            canExecute = false;
                            break;
                        }
                    }

                    if (canExecute) {
                        for (let j = 0; j < resources; j++) {
                            work[j] += tempAllocation[i][j];
                        }
                        finish[i] = true;
                        safeSequence.push(i);
                        found = true;
                    }
                }
            }
        } while (found);

        for (let i = 0; i < processes; i++) {
            if (!finish[i]) {
                isSafe = false;
                break;
            }
        }

        if (isSafe) {
            displayRequestResult(true, "REQUEST APPROVED", request, tempAllocation, tempAvailable, safeSequence, maximum);
        } else {
            displayRequestResult(false, "REQUEST DENIED", request, null, null, null, null);
        }
    }

    function displayRequestResult(isApproved, message, request, tempAllocation, tempAvailable, safeSequence, maximum) {
        const resultDiv = document.getElementById('requestResultDiv');
        const processes = parseInt(document.getElementById('processes').value);
        const resources = parseInt(document.getElementById('resources').value);
        
        let html = '';

        if (isApproved) {
            html = `
                <div class="result-card approved">
                    <div class="status-badge safe">✓ ${message}</div>
                    <div class="result-details">
                        <p><strong>Request Status:</strong> SAFE - Request can be granted</p>
                        <p><strong>Safe Sequence:</strong> ${safeSequence.map(p => `P${p}`).join(" → ")}</p>
                    </div>
                </div>
            `;

            // Updated Available
            html += `
                <div class="result-card">
                    <div class="result-title">📦 Updated Available Resources:</div>
                    <div class="result-details">
            `;
            for (let i = 0; i < resources; i++) {
                html += `<p>Resource ${i + 1}: ${tempAvailable[i]}</p>`;
            }
            html += `</div></div>`;

            // Updated Allocation
            html += `
                <div class="result-card">
                    <div class="result-title">🎯 Updated Allocation Matrix:</div>
                    <div class="result-details" style="overflow-x: auto;">
                        <table class="matrix" style="margin-top: 10px;">
            `;
            
            // Create header
            html += `<tr><th>Process</th>`;
            for (let j = 0; j < resources; j++) {
                html += `<th>R${j + 1}</th>`;
            }
            html += `</tr>`;
            
            // Add allocation data
            for (let i = 0; i < processes; i++) {
                html += `<tr><td><b>P${i}</b></td>`;
                for (let j = 0; j < resources; j++) {
                    html += `<td>${tempAllocation[i][j]}</td>`;
                }
                html += `</tr>`;
            }
            
            html += `</table></div></div>`;

            // Updated Need
            html += `
                <div class="result-card">
                    <div class="result-title">📋 Updated Need Matrix:</div>
                    <div class="result-details" style="overflow-x: auto;">
                        <table class="matrix" style="margin-top: 10px;">
            `;
            
            // Create header
            html += `<tr><th>Process</th>`;
            for (let j = 0; j < resources; j++) {
                html += `<th>R${j + 1}</th>`;
            }
            html += `</tr>`;
            
            // Add need data
            for (let i = 0; i < processes; i++) {
                html += `<tr><td><b>P${i}</b></td>`;
                for (let j = 0; j < resources; j++) {
                    const need = maximum[i][j] - tempAllocation[i][j];
                    html += `<td>${need}</td>`;
                }
                html += `</tr>`;
            }
            
            html += `</table></div></div>`;

        } else {
            html = `
                <div class="result-card denied">
                    <div class="status-badge unsafe">✗ ${message}</div>
                    <div class="result-details">
                        <p><strong>Request Status:</strong> UNSAFE - Request cannot be granted</p>
                        <p>The system would enter an unsafe state if this request is allocated.</p>
                        <p>Either wait for resources to be released or reduce the request.</p>
                    </div>
                </div>
            `;
        }

        resultDiv.innerHTML = html;
        resultDiv.classList.add('show');
    }

    // ========== EVENT LISTENERS ==========

    document.getElementById('processes').addEventListener('blur', function () {
        createMatrixInput('allocation');
        createMatrixInput('maximum');
        createAvailableResourcesInput();
        populateProcessDropdown();
        createResourceRequestInputs();
    });

    document.getElementById('resources').addEventListener('blur', function () {
        createMatrixInput('allocation');
        createMatrixInput('maximum');
        createAvailableResourcesInput();
        populateProcessDropdown();
        createResourceRequestInputs();
    });

    // Initialize on page load
    createAvailableResourcesInput();
