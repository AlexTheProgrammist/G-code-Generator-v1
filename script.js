document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Show printer selection on page load
    showPrinterSelection();
});

function showPrinterSelection() {
    document.getElementById('mainContent').innerHTML = `
        <div class="printer-selection">
            <div class="printer-card" onclick="selectPrinter('generic')">
                <h3>Generic Printer</h3>
                <p>A simple configuration suitable for most printers.</p>
            </div>
            <div class="printer-card" onclick="selectPrinter('anycubic')">
                <h3>Anycubic Kobra Max</h3>
                <p>Optimized settings for Anycubic Kobra Max printer.</p>
            </div>
        </div>
    `;
}

function selectPrinter(printer) {
    localStorage.setItem('selectedPrinter', printer);
    
    loadMainInterface();
}

function loadMainInterface() {
    const selectedPrinter = localStorage.getItem('selectedPrinter');
    let maxBedTemp, maxNozzleTemp;
    let gcodeContent = '';
    let isBasicGcodeChecked = false;

    if (selectedPrinter === 'generic') {
        maxBedTemp = 100;
        maxNozzleTemp = 300;
    } else if (selectedPrinter === 'anycubic') {
        maxBedTemp = 110;
        maxNozzleTemp = 260;
        isBasicGcodeChecked = false;
        gcodeContent = `; Basic G-code for Anycubic Kobra Max
G28 ; Home all axes
G29 ; Enable bed leveling mesh
`; 
    }

    let basicGcodeCard = '';
    if (selectedPrinter === 'anycubic') {
        basicGcodeCard = `
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-warning text-white">Basic G-code</div>
                <div class="card-body">
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="basicGcode" onchange="toggleBasicGcode()" ${isBasicGcodeChecked ? 'checked' : ''}>
                        <label class="form-check-label" for="basicGcode">Use Basic G-code for Anycubic Kobra Max</label>
                    </div>
<div id="basicGcodeSettings" class="hidden-settings"></div>
                </div>
            </div>
        `;
    }
    document.getElementById('mainContent').innerHTML = `
        <div class="row">
            <!-- Settings Column -->
            <div class="col-md-6">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">General Settings</div>
                    <div class="card-body">
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="homeAxes" onchange="updateGCode()">
                            <label class="form-check-label" for="homeAxes">Home All Axes (G28)
                            <span class="info-icon" data-bs-toggle="tooltip" title="Moves all axes to their home position.">ℹ</span>
                              <span class="recommended-icon">⭐ Recommended</span>
                            </label>
                        </div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="enableMesh" onchange="updateGCode()">
                            <label class="form-check-label" for="enableMesh">Enable Bed Level Mesh (G29)
                             <span class="info-icon" data-bs-toggle="tooltip" title="Performs a bed leveling routine.">ℹ</span>
                              <span class="recommended-icon">⭐ Recommended</span>
                            </label>
                        </div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="cleanNozzle" onchange="updateGCode()">
                            <label class="form-check-label" for="cleanNozzle">Clean and Prepare Nozzle
                            <span class="info-icon" data-bs-toggle="tooltip" title="Extrudes some filament to ensure smooth flow.">ℹ</span>
                            </label>
                        </div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="wipeMoves" onchange="updateGCode()">
                            <label class="form-check-label" for="wipeMoves">Wipe Moves Before Start
                            <span class="info-icon" data-bs-toggle="tooltip" title="Moves the nozzle to remove excess filament.">ℹ</span>
                            </label>
                        </div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="filamentRetract" onchange="updateGCode()">
                            <label class="form-check-label" for="filamentRetract">Retract Filament Before Start
                            <span class="info-icon" data-bs-toggle="tooltip" title="Retracts filament slightly to prevent oozing.">ℹ</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-secondary text-white">Temperature Settings</div>
                    <div class="card-body">
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="enableBedTemp" onchange="toggleTempSettings()">
                            <label class="form-check-label" for="enableBedTemp">Enable Bed Temperature
                            <span class="info-icon" data-bs-toggle="tooltip" title="Enables setting the bed temperature before printing.">ℹ</span>
                            </label>
                        </div>
                        <div id="bedTempSettings" class="hidden-settings">
                            <label for="bedTempValue" class="form-label">Bed Temperature (&#8451;)</label>
                            <input type="number" id="bedTempValue" class="form-control" value="${maxBedTemp}" min="0" onchange="validateTemperature()">
                        </div>
                        <div class="form-check form-switch mt-4 mb-3">
                            <input class="form-check-input" type="checkbox" id="enableNozzleTemp" onchange="toggleTempSettings()">
                            <label class="form-check-label" for="enableNozzleTemp">Enable Nozzle Temperature
                             <span class="info-icon" data-bs-toggle="tooltip" title="Enables setting the nozzle temperature before printing.">ℹ</span>
                            </label>
                        </div>
                        <div id="nozzleTempSettings" class="hidden-settings">
                            <label for="nozzleTempValue" class="form-label">Nozzle Temperature (&#8451;)</label>
                            <input type="number" id="nozzleTempValue" class="form-control" value="${maxNozzleTemp}" min="0" onchange="validateTemperature()">
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-info text-white">Filament Sensor Settings</div>
                    <div class="card-body">
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="enableFilamentSensor" onchange="toggleSensorSettings()">
                            <label class="form-check-label" for="enableFilamentSensor">Enable Filament Sensor
                            <span class="info-icon" data-bs-toggle="tooltip" title="Activates the filament sensor to detect filament presence.">ℹ</span>
                             <span class="recommended-icon">⭐ Recommended</span>
                            </label>
                        </div>
                        <div id="sensorSettings" class="hidden-settings">
                            <label for="filamentSensor" class="form-label">Filament Sensor</label>
                            <select id="filamentSensor" class="form-select" onchange="updateGCode()">
                                <option value="on">On</option>
                                <option value="off">Off</option>
                            </select>
                        </div>
                    </div> 
                    
                </div>

            ${basicGcodeCard} 

            </div>
            <!-- G-code Output Column -->
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white">G-code Output</div>
<div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Output</strong>
        <button class="btn btn-sm btn-success" id="copyGcodeBtn" onclick="copyGcode()">
            Copy G-code
        </button>
    </div>
    <div class="output" id="gcodeOutput">Your G-code will appear here...</div>
</div>
                </div>
            </div>
        </div>
       
    `;

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    updateGCode();
}

function updateGCode() {
    const selectedPrinter = localStorage.getItem('selectedPrinter');
    let gcode = `; Printer: ${selectedPrinter}\n`;

    if (selectedPrinter === 'anycubic' && document.getElementById('basicGcode')?.checked) {
        gcode += `; Basic G-code for Anycubic Kobra Max\n`;
        gcode += `G28 ; Home all axes\n`;
        gcode += `G29 ; Enable bed leveling mesh\n`;
    }

// 2️⃣ Авто-включение температурных настроек, если Clean Nozzle, Wipe Moves или Retract Filament включены
const cleanNozzle = document.getElementById('cleanNozzle')?.checked;
const wipeMoves = document.getElementById('wipeMoves')?.checked;
const filamentRetract = document.getElementById('filamentRetract')?.checked;
const enableBedTemp = document.getElementById('enableBedTemp');
const enableNozzleTemp = document.getElementById('enableNozzleTemp');
const bedTempSettings = document.getElementById('bedTempSettings'); // Поле ввода температуры стола
const nozzleTempSettings = document.getElementById('nozzleTempSettings'); // Поле ввода температуры сопла

if (cleanNozzle || wipeMoves) {
    enableBedTemp.checked = true;
    enableNozzleTemp.checked = true;

    // Показываем поля ввода температуры
    bedTempSettings.style.display = "block";
    nozzleTempSettings.style.display = "block";
}

if (filamentRetract) {
    enableNozzleTemp.checked = true;
    nozzleTempSettings.style.display = "block"; // Показываем поле ввода температуры сопла
}

    if (document.getElementById('enableFilamentSensor').checked) {
        const filamentSensorValue = document.getElementById('filamentSensor').value;
        gcode += filamentSensorValue === "on" ? "M413 S1 ; Turn on filament sensor\n" : "M413 S0 ; Turn off filament sensor\n";
    }

    if (document.getElementById('homeAxes').checked) {
        gcode += "G28 ; Home all axes\n";
    }

    if (document.getElementById('enableMesh').checked) {
        gcode += "G29 ; Enable bed level mesh\n";
    }

   if (document.getElementById('enableBedTemp').checked) {
        let bedTempValue = document.getElementById('bedTempValue').value;
        gcode += `M140 S${bedTempValue} ; Set bed temperature\n`;
    }

    if (document.getElementById('enableNozzleTemp').checked) {
        let nozzleTempValue = document.getElementById('nozzleTempValue').value;
        gcode += `M104 S${nozzleTempValue} ; Set nozzle temperature\n`;
    }

    if (document.getElementById('filamentRetract').checked) {
        gcode += "G1 E-3 F3000 ; Retract filament slightly\n";
    }

    if (cleanNozzle) {
        if (selectedPrinter === 'anycubic') {
            gcode += `
; Nozzle priming for Anycubic Kobra Max
G92 E0
G1 Z15.0 F6000
G1 X0 Y0 F3000
G1 Z0.2 F3000
G1 X60.0 E9.0 F1000
G1 X100.0 E12.0 F1000
G92 E0
            `;
        } else {
            gcode += `
; Nozzle priming for Generic Printer
G92 E0
G1 Z10.0 F6000
G1 X0 Y0 F3000
G1 Z0.3 F3000
G1 X40.0 E5.0 F1200
G92 E0
            `;
        }
    }

    if (wipeMoves) {
        if (selectedPrinter === 'anycubic') {
            gcode += `
; Wipe moves for Anycubic Kobra Max
G1 X60 Y10 F5000
G1 X100 Y15 F5000
G1 X60 Y20 F5000
            `;
        } else {
            gcode += `
; Wipe moves for Generic Printer
G1 X40 Y10 F4000
G1 X80 Y15 F4000
G1 X40 Y20 F4000
            `;
        }
    }

      document.getElementById('gcodeOutput').innerText = gcode;
}

function toggleBasicGcode() {
    const basicGcodeSettings = document.getElementById('basicGcodeSettings');
    const enableMeshCheckbox = document.getElementById('enableMesh'); // Чекбокс G29
    const homeAxesCheckbox = document.getElementById('homeAxes'); // Чекбокс G28

    if (document.getElementById('basicGcode').checked) {
        basicGcodeSettings.style.display = "block";
        enableMeshCheckbox.disabled = true; // Блокируем G29
        enableMeshCheckbox.checked = false; // Выключаем G29
        homeAxesCheckbox.checked = false; // Выключаем G28
        homeAxesCheckbox.disabled = true; // Блокируем G28
    } else {
        basicGcodeSettings.style.display = "none";
        enableMeshCheckbox.disabled = false; // Разблокируем G29
        homeAxesCheckbox.disabled = false; // Разблокируем G28
    }

    updateGCode(); // ОБНОВЛЕНИЕ G-кода сразу после переключения
}


function disableOtherSettings() {
    document.getElementById('homeAxes').disabled = true;
    document.getElementById('enableMesh').disabled = true;
}

function enableAllSettings() {
    document.getElementById('homeAxes').disabled = false;
    document.getElementById('enableMesh').disabled = false;
}

function toggleTempSettings() {
    const bedTempSettings = document.getElementById('bedTempSettings');
    const nozzleTempSettings = document.getElementById('nozzleTempSettings');

    if (document.getElementById('enableBedTemp').checked) {
        bedTempSettings.style.display = "block";
        updateGCode(); // Ensure default value is added immediately
    } else {
        bedTempSettings.style.display = "none";
        removeGCodeCommand("M140");
    }

    if (document.getElementById('enableNozzleTemp').checked) {
        nozzleTempSettings.style.display = "block";
        updateGCode(); // Ensure default value is added immediately
    } else {
        nozzleTempSettings.style.display = "none";
        removeGCodeCommand("M104");
    }
}

function toggleSensorSettings() {
    const sensorSettings = document.getElementById('sensorSettings');

    if (document.getElementById('enableFilamentSensor').checked) {
        sensorSettings.style.display = "block";
        updateGCode(); // Add filament sensor setting to G-code
    } else {
        sensorSettings.style.display = "none";
        removeGCodeCommand("M413"); // Remove filament sensor command from G-code
    }
}

function removeGCodeCommand(command) {
    const output = document.getElementById('gcodeOutput').innerText;
    const lines = output.split("\n");
    const filteredLines = lines.filter(line => !line.startsWith(command));
    document.getElementById('gcodeOutput').innerText = filteredLines.join("\n");
}

function validateTemperature() {
    const selectedPrinter = localStorage.getItem('selectedPrinter');

    let maxBedTemp, maxNozzleTemp;

    if (selectedPrinter === 'generic') {
        maxBedTemp = 100;
        maxNozzleTemp = 300;
    } else if (selectedPrinter === 'anycubic') {
        maxBedTemp = 110;
        maxNozzleTemp = 260;
    }

    const bedTempInput = document.getElementById('bedTempValue');
    if (bedTempInput.value > maxBedTemp) {
        bedTempInput.value = maxBedTemp;
    }

    const nozzleTempInput = document.getElementById('nozzleTempValue');
    if (nozzleTempInput.value > maxNozzleTemp) {
        nozzleTempInput.value = maxNozzleTemp;
    }

    updateGCode(); // Refresh G-code after validation
}


////////////////////////////////////////////////////////

function updateTitle(title) {
    document.querySelector('.generator-title').innerText = title;
}


function setActiveTab(element) {
    // Remove "active" class from all navigation links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Add "active" class to the clicked link
    element.classList.add('active');
}

function showPrinterSelection() {
    updateTitle("Start G-code Generator");
    document.getElementById('mainContent').innerHTML = `
        <div class="container mt-4 text-center">
            <h2>Printer Selection</h2>
            <p>Choose your printer model to configure G-code.</p>

            <div class="printer-selection">
                <div class="printer-card" onclick="selectPrinter('generic')">
                    <h3>Generic Printer</h3>
                    <p>A simple configuration suitable for most printers.</p>
                </div>
                <div class="printer-card" onclick="selectPrinter('anycubic')">
                    <h3>Anycubic Kobra Max</h3>
                    <p>Optimized settings for Anycubic Kobra Max.</p>
                </div>
            </div>
        </div>
    `;
}

function loadCalibrationTab() {
    updateTitle("Calibration"); // Update the title

    document.getElementById('mainContent').innerHTML = `
        <div class="container mt-4">
            <h2>Calibrate your printer!</h2>
            <p>Select a calibration type and get the appropriate G-code.</p>

            <div class="calibration-section">
                <button class="btn btn-danger" onclick="loadEStepsCalibration()">E-Steps Calibration</button>
                <button class="btn btn-primary" onclick="loadFlowCalibration()">Flow Calibration</button>
                <button class="btn btn-secondary" onclick="loadPIDCalibration()">PID Calibration</button>
                <button class="btn btn-warning" onclick="loadPACalibration()">Pressure Advance</button>
                
            </div>

            <div id="calibrationContent" class="mt-4"></div>
        </div>
    `;
}

function loadEStepsCalibration() {
    updateTitle("E-Steps Calibration"); // Update the title

    document.getElementById('calibrationContent').innerHTML = `
        <div class="container mt-4">
            <h3 class="text-center">E-Steps Calibration Guide</h3>

            <p><strong>What is E-Steps Calibration?</strong></p>
            <p>E-steps calibration ensures that your extruder moves the correct amount of filament. 
            If the steps per millimeter (E-steps) are incorrect, your printer may under-extrude or over-extrude, leading to poor print quality.</p>

            <hr>

            <p><strong>Step 1: Checking Your Current E-Steps</strong></p>
            <p>First, retrieve your current E-steps value by sending the following command in
             <a href="#" onclick="setActiveTab(this); loadTerminalSetup()" class="tooltip-link" data-tooltip="Check out on how to connect via Terminal">Pronterface</a>:</p>
            <pre>M503</pre>
            <p>Look for a line that starts with <strong>M92</strong>. It should look like this:</p>
            <pre>M92 X80.00 Y80.00 Z400.00 E93.00</pre>
            <p>Here, the E-value (<strong>E93.00</strong>) represents the current extruder steps per millimeter.</p>

            <hr>

            <p><strong>Step 2: Measuring Extrusion Length</strong></p>
            <p>Now, follow these steps to measure and calibrate extrusion:</p>
            <ul>
                <li>Preheat your hotend to the printing temperature of your filament.</li>
                <li>Cut and straighten a piece of filament.</li>
                <li>Measure <strong>100mm</strong> from where the filament enters the extruder and mark it.</li>
                <li>Run the following command to extrude 100mm:</li>
            </ul>
            <pre>G92 E0  ; Reset extruder position
G1 E100 F100  ; Extrude 100mm of filament</pre>
            <p>Once the extrusion is complete, measure how much filament was actually used.</p>

            <hr>

           <p><strong>Step 3: Calculate the Correct E-Steps</strong></p>
            <p>Use the calculator below to find the correct E-Steps value.</p>

            <div class="card p-3">
                <label for="currentESteps" class="form-label">Current E-Steps Value:</label>
                <input type="number" id="currentESteps" class="form-control" placeholder="Enter current E-Steps (e.g., 93.00)">

                <label for="measuredFilament" class="form-label mt-3">Measured Filament (mm):</label>
                <input type="number" id="measuredFilament" class="form-control" placeholder="Enter actual extruded length (e.g., 95)">

                <button class="btn btn-primary mt-3" onclick="calculateESteps()">Calculate New E-Steps</button>

                <p class="mt-3"><strong>New E-Steps Value:</strong> <span id="newESteps" class="text-success">---</span></p>
            </div>

            <hr>

            <p><strong>Step 4: Apply the New Value to Your Printer</strong></p>
            <p>Click the button below to apply the new value, then save it to the printer.</p>

            <button class="btn btn-success" onclick="setNewESteps()">Set New Value</button>

            <pre id="gcodeOutput" class="output mt-3">G-code will appear here...</pre>

            <hr>

            <p><strong>Step 5: Verifying and Repeating the Process</strong></p>
            <ul>
                <li>Run the test again and check if exactly 100mm of filament is extruded.</li>
                <li>If the extrusion is still inaccurate, repeat the calculation and update the E-Steps again.</li>
            </ul>

            <hr>

            <p><strong>Why is E-Steps Calibration Important?</strong></p>
            <p>Incorrect E-steps lead to over-extrusion or under-extrusion, affecting print accuracy and strength. 
            Calibrating E-steps ensures precise filament flow and consistent print quality.</p>
        </div>
    `;
}

// Function to calculate the correct E-Steps value
function calculateESteps() {
    const currentESteps = parseFloat(document.getElementById('currentESteps').value);
    const measuredFilament = parseFloat(document.getElementById('measuredFilament').value);

    if (isNaN(currentESteps) || isNaN(measuredFilament) || measuredFilament <= 0) {
        document.getElementById('newESteps').innerText = "Invalid input!";
        return;
    }

    const newESteps = (currentESteps * 100) / measuredFilament;
    document.getElementById('newESteps').innerText = newESteps.toFixed(2);
}

// Function to set the new E-Steps value
function setNewESteps() {
    const newESteps = document.getElementById('newESteps').innerText;

    if (newESteps === "---" || newESteps === "Invalid input!") {
        document.getElementById('gcodeOutput').innerText = "⚠️ Please calculate E-Steps before setting the new value.";
        return;
    }

    // Display the G-code commands
    document.getElementById('gcodeOutput').innerText = `
M92 E${newESteps}  ; Set new E-Steps value
M500   ; Save settings to EEPROM
    `;
}



function loadFlowCalibration() {
    

    document.getElementById('calibrationContent').innerHTML = `
        <div class="container mt-4">
            <h3 class="text-center">Flow Rate Calibration Guide</h3>
            
            <p><strong>What is Flow Rate Calibration?</strong></p>
            <p>Flow rate calibration ensures that the correct amount of filament is extruded during printing. 
            Incorrect flow settings can lead to under-extrusion (gaps, weak prints) or over-extrusion (blobs, loss of detail). 
            Unlike <strong>E-steps calibration</strong>, which adjusts physical extrusion distance, flow rate calibration fine-tunes filament output in the slicer.</p>

            <hr>

            <p><strong>Step 1: Preparation</strong></p>
            <ul>
                <li>Ensure your <strong>E-steps</strong> are already calibrated correctly.</li>
                <li>Use a <strong>fresh, high-quality filament</strong> for accurate results.</li>
                <li>Set the <strong>nozzle temperature</strong> to the recommended value for your filament.</li>
            </ul>

            <hr>

            <p><strong>Step 2: Printing a Test Cube</strong></p>
            <ul>
                <li><a href="xyzCalibration_cube.stl" download class="btn btn-success">Download</a> or create a <strong>20x20x20 mm single-wall cube</strong> with:
                    <ul>
                        <li><strong>One perimeter</strong> (wall count = 1)</li>
                        <li><strong>No infill</strong></li>
                        <li><strong>No top or bottom layers</strong></li>
                        <li>Wall width = <strong>extrusion width</strong> (e.g., 0.4 mm for a 0.4 mm nozzle)</li>
                    </ul>
                </li>
                <li>Slice the model and print it.</li>
                <li>Once printed, use <strong>digital calipers</strong> to measure the actual wall thickness.</li>
            </ul>

            <hr>

           <p><strong>Step 3: Calculate the Correct Flow Rate</strong></p>
            <p>Use the calculator below to find the correct Flow Rate (Extrusion Multiplier).</p>

            <div class="card p-3">
                <label for="expectedThickness" class="form-label">Expected Wall Thickness (mm):</label>
                <input type="number" id="expectedThickness" class="form-control" placeholder="Enter expected thickness (e.g., 0.4)">

                <label for="measuredThickness" class="form-label mt-3">Measured Wall Thickness (mm):</label>
                <input type="number" id="measuredThickness" class="form-control" placeholder="Enter actual wall thickness (e.g., 0.45)">

                <label for="currentFlowRate" class="form-label mt-3">Current Flow Rate (%):</label>
                <input type="number" id="currentFlowRate" class="form-control" placeholder="Enter current flow rate (e.g., 100)">

                <button class="btn btn-primary mt-3" onclick="calculateFlowRate()">Calculate New Flow Rate</button>

                <p class="mt-3"><strong>New Flow Rate (%):</strong> <span id="newFlowRate" class="text-success">---</span></p>
            </div>

            <hr>

            <p><strong>Step 4: Applying the New Flow Rate</strong></p>
            <ul>
                <li>Open your slicer settings.</li>
                <li>Navigate to <strong>Flow Rate (or Extrusion Multiplier)</strong>.</li>
                <li>Enter the <strong>new calculated value</strong> (e.g., 88.9%).</li>
                <li>Save and re-slice your model.</li>
                <li>Reprint the test cube to verify the new measurement.</li>
                <li>Repeat the process if necessary until the wall thickness matches the expected value.</li>
            </ul>

            <hr>

            <p><strong>Why is This Important?</strong></p>
            <p>Even if your <strong>E-steps</strong> are calibrated correctly, different filaments require different flow adjustments due to variations in diameter and material properties. 
            Fine-tuning your flow rate ensures <strong>better print quality, accurate dimensions, and stronger layer adhesion</strong>.</p>

           
        </div>
    `;
}

function calculateFlowRate() {
    const expectedThickness = parseFloat(document.getElementById('expectedThickness').value);
    const measuredThickness = parseFloat(document.getElementById('measuredThickness').value);
    const currentFlowRate = parseFloat(document.getElementById('currentFlowRate').value);

    if (isNaN(expectedThickness) || isNaN(measuredThickness) || isNaN(currentFlowRate) || measuredThickness <= 0 || expectedThickness <= 0) {
        document.getElementById('newFlowRate').innerText = "Invalid input!";
        return;
    }

    const newFlowRate = (expectedThickness / measuredThickness) * currentFlowRate;
    document.getElementById('newFlowRate').innerText = newFlowRate.toFixed(2);
}


function loadPIDCalibration() {
   

    document.getElementById('calibrationContent').innerHTML = `
        <div class="container mt-4">
            <h3 class="text-center">PID Calibration Guide</h3>

            <p><strong>What is PID Calibration?</strong></p>
            <p>PID (Proportional, Integral, Derivative) calibration ensures stable and precise temperature control for your hotend and heated bed. 
            A poorly tuned PID system can lead to temperature fluctuations, causing print defects like inconsistent extrusion, layer separation, or adhesion issues.</p>

            <hr>

            <p><strong>Step 1: Checking Your Current PID Settings</strong></p>
            <p>Before making changes, check your current PID values by sending the following command to your printer via 
             <a href="#" onclick="setActiveTab(this); loadTerminalSetup()" class="tooltip-link" data-tooltip="Check out on how to connect via Terminal">Terminal</a>:</p>
            <pre>M503</pre>
            <p>Look for a line that starts with <strong>M301</strong> (hotend PID) or <strong>M304</strong> (bed PID). These values indicate the current PID settings.</p>

            <hr>

            <p><strong>Step 2: Running PID Autotune for the Hotend</strong></p>
            <p>To calibrate the hotend, send the following command:</p>
            <pre>M303 E0 S200 C10</pre>
            <ul>
                <li><strong>E0</strong> → Hotend number (use E1 for a second extruder if available)</li>
                <li><strong>S200</strong> → Target temperature (adjust based on your filament type, e.g., 210 for PLA, 240 for PETG)</li>
                <li><strong>C10</strong> → Number of calibration cycles</li>
            </ul>
            <p>Wait for the calibration to finish. The printer will output new PID values.</p>

            <hr>

            <p><strong>Step 3: Saving the New PID Values</strong></p>
            <p>Once the autotune process is complete, the printer will suggest new PID values. Save them using:</p>
            <pre>M301 P<value> I<value> D<value></pre>
            <p>For example:</p>
            <pre>M301 P22.4 I1.67 D78.5</pre>
            <p>Then, store the values permanently:</p>
            <pre>M500</pre>

            <hr>

            <p><strong>Step 4: Running PID Autotune for the Heated Bed (Optional)</strong></p>
            <p>If your printer has a heated bed, you can also calibrate its PID by using:</p>
            <pre>M303 E-1 S60 C10</pre>
            <p>Follow the same process as with the hotend and save the new values with:</p>
            <pre>M304 P<value> I<value> D<value>
M500</pre>

            <hr>

            <p><strong>Why is PID Calibration Important?</strong></p>
            <p>Properly tuned PID settings help maintain consistent temperature, reducing print defects and improving reliability. 
            This is especially important when switching between different filaments or upgrading hardware.</p>

            <hr>


        </div>
    `;
}

function loadPACalibration() {
   

    document.getElementById('calibrationContent').innerHTML = `
        <div class="container mt-4">
            <h3 class="text-center">Pressure Advance Calibration Guide</h3>

            <p><strong>What is Pressure Advance?</strong></p>
            <p>Pressure Advance (PA) compensates for filament pressure buildup in the hotend, improving print quality by reducing blobs, stringing, and inconsistent extrusion during high-speed printing.</p>

            <hr>

            <p><strong>Step 1: Checking if Pressure Advance is Enabled</strong></p>
            <p>Most firmware does not enable Pressure Advance by default. Check your current setting by 
            <a href="#" onclick="setActiveTab(this); loadTerminalSetup()" class="tooltip-link" data-tooltip="Check out on how to connect via Terminal">sending</a>:</p>
            <pre>M503</pre>
            <p>Look for a line that starts with <strong>M900 K</strong>. If no value appears, Pressure Advance is likely disabled.</p>

            <hr>

            <p><strong>Step 2: Printing a Test Pattern</strong></p>
            <p>To determine the optimal PA value, print a test pattern with varying K values. You can generate one using OrcaSlicer</p>
            <p><strong>Choose Your Setup:</strong></p>
            <ul>
                <li>Start by selecting your <strong>printer</strong>, the <strong>filament type</strong>, and the specific <strong>printing process</strong> you want to use for the calibration.</li>
            </ul>

            <p><strong>Access Calibration Menu:</strong></p>
            <ul>
                <li>Launch <strong>OrcaSlicer</strong> and open the calibration menu.</li>
                <li>Select the <strong>Pressure Advance</strong> option.</li>
                <li>A dialog box will prompt you to choose between a <strong>Direct Drive Extruder (DDE)</strong> or a <strong>Bowden</strong> setup, as the test adjusts based on the type of extruder you have.</li>
                <li>Choose the <strong>PA Tower</strong> for this calibration method.</li>
            </ul>

            <p><strong>Test Generation:</strong></p>
            <ul>
                <li>The default values for <strong>start PA</strong>, <strong>end PA</strong>, and <strong>PA step</strong> should work fine for most tests.</li>
                <li>After setting up, the software will generate the test, which won't be visible in the <strong>Prepare</strong> window due to its custom G-code nature.</li>
                <li>Switch to the <strong>Preview</strong> tab to see the sliced project, displaying a tower with varying PA values across its height.</li>
                <li>For better results, it is recommended to print at a speed above <strong>120 mm/s</strong>.</li>
            </ul>


            <hr>

            <p><strong>Step 3: Evaluating the Results</strong></p>
            <p>After printing, examine the test tower:</p>
            <ul>
                <li>Carefully assess each corner of the tower. Identify the height where the print shows the best balance, marking it for reference.</li>
                <li>Calculate your new PA value based on the marked height and adjust your printer’s settings accordingly to achieve the best print quality.</li>
                
            </ul>

            <hr>

            <p><strong>Step 4: Setting and Saving the Optimal Pressure Advance</strong></p>
            <p>Once you've determined the best PA value, set it with:</p>
            <pre>M900 K<your_value></pre>
            <p>For example, if 0.08 produced the best results:</p>
            <pre>M900 K0.08</pre>
            <p>To save the setting permanently:</p>
            <pre>M500</pre>

            <hr>

            <p><strong>Why is Pressure Advance Important?</strong></p>
            <p>Correct PA settings improve print quality, especially at high speeds. It is particularly useful for Bowden extruders, where filament compression and retraction lag are more pronounced.</p>

            <hr>

        </div>
    `;
}

function loadTerminalSetup() {
    updateTitle("Terminal Setup (Pronterface)"); // Update the title

    document.getElementById('mainContent').innerHTML = `
        <div class="container mt-4">
            <h3 class="text-center">Connecting to Your Printer via Pronterface</h3>

            <p><strong>What is Pronterface?</strong></p>
            <p>Pronterface (or Printrun) is a user-friendly interface for sending G-code commands to your 3D printer via USB. 
            It allows you to manually control the printer, adjust settings, and troubleshoot issues.</p>

            <hr>

            <p><strong>Step 1: Download and Install Pronterface</strong></p>
            <ul>
                <li>Go to the official <a href="https://www.pronterface.com/" target="_blank">Pronterface website</a>.</li>
                <li>Download the correct version for your operating system (Windows, macOS, or Linux).</li>
                <li>Install the software and launch it.</li>
            </ul>

            <hr>

            <p><strong>Step 2: Connecting to Your Printer</strong></p>
            <ul>
                <li>Connect your 3D printer to your computer via <strong>USB cable</strong>.</li>
                <li>Open Pronterface and select the correct <strong>COM port</strong> (e.g., COM3, /dev/ttyUSB0).</li>
                <li>Set the baud rate to <strong>115200</strong> or <strong>250000</strong> (depending on your firmware).</li>
                <li>Click the <strong>Connect</strong> button.</li>
            </ul>

            <p><strong>If successful:</strong></p>
            <ul>
                <li>The terminal will display firmware details and a "Printer is now online" message.</li>
                <li>You can now send commands and control the printer.</li>
            </ul>

            <hr>

            <p><strong>Step 3: Sending Basic G-code Commands</strong></p>
            <p>Once connected, you can manually send G-code commands. Some useful commands include:</p>

            <pre>
M503   ; Display current firmware settings
G28    ; Home all axes
G29    ; Perform bed leveling
M106 S255  ; Turn on fan at full speed
M104 S200  ; Set nozzle temperature to 200°C
M140 S60   ; Set bed temperature to 60°C
M500   ; Save settings
            </pre>

            <p>Type any command in the terminal and press <strong>Enter</strong> to send it.</p>

            <hr>

            <p><strong>Step 4: Checking and Adjusting Settings</strong></p>
            <ul>
                <li>Use <strong>M503</strong> to check current printer settings.</li>
                <li>Modify values using commands like <strong>M92</strong> (steps per mm) or <strong>M301</strong> (PID tuning).</li>
                <li>After making changes, save them with <strong>M500</strong>.</li>
            </ul>

            <hr>

            <p><strong>Troubleshooting Connection Issues</strong></p>
            <ul>
                <li>If Pronterface <strong>does not detect the printer</strong>, check that:
                    <ul>
                        <li>The correct <strong>COM port</strong> is selected.</li>
                        <li>The baud rate matches the firmware settings.</li>
                        <li>The printer is powered on.</li>
                        <li>Drivers for your printer’s USB chipset (e.g., CH340) are installed.</li>
                    </ul>
                </li>
                <li>If you get a <strong>"Permission denied"</strong> error on Linux/macOS, try:</li>
                <pre>sudo chmod a+rw /dev/ttyUSB0</pre>
                <li>If connection drops randomly, try <strong>lowering the baud rate</strong> (115200 instead of 250000).</li>
            </ul>

            <hr>

            <p><strong>Step 3: Select a G-code Command Category</strong></p>
            <p>Choose a category below to see commonly used G-code commands.</p>

            <select id="gcodeCategory" class="form-select mb-3" onchange="generateGCodePreset()">
                <option value="" selected>Select a command category...</option>
                <option value="movement">Movement Commands</option>
                <option value="temperature">Temperature Commands</option>
                <option value="extrusion">Extrusion & Retraction</option>
                <option value="diagnostics">Diagnostics & Configuration</option>
            </select>

            <pre id="gcodeOutput" class="output mt-3">G-code will appear here...</pre>
        </div>
    `;
}

function generateGCodePreset() {
    const category = document.getElementById('gcodeCategory').value;
    let gcode = "";

    switch (category) {
        case "movement":
            gcode = `
G28    ; Home all axes
G1 X100 Y100 Z10 F3000    ; Move to position (100,100,10) at 3000 mm/min
G0 X0 Y0 Z0    ; Move back to home position`;
            break;
        case "temperature":
            gcode = `
M104 S200    ; Set nozzle temperature to 200°C
M140 S60    ; Set bed temperature to 60°C
M105    ; Get current temperature readings`;
            break;
        case "extrusion":
            gcode = `
G92 E0    ; Reset extruder position
G1 E10 F200    ; Extrude 10mm of filament
G1 E-3 F200    ; Retract 3mm of filament`;
            break;
        case "diagnostics":
            gcode = `
M503    ; Display current settings
M115    ; Get firmware version
M119    ; Check endstop status`;
            break;
        default:
            gcode = "Please select a command category.";
    }

    document.getElementById('gcodeOutput').innerText = gcode;
}

function copyGcode() {
    const gcodeText = document.getElementById('gcodeOutput').innerText;

    navigator.clipboard.writeText(gcodeText).then(() => {
        const toast = new bootstrap.Toast(document.getElementById('gcodeToast'));
        toast.show();
    }).catch(() => {
        alert("❌ Не удалось скопировать. Попробуйте вручную.");
    });
}
