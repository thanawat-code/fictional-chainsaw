export default async function decorate(block) {
  block.innerHTML = '';
  
  // Create Tab Navigation
  const tabContainer = document.createElement('div');
  tabContainer.className = 'flight-search-tabs';
  tabContainer.innerHTML = `
    <button class="tab-btn active" data-type="return">Return</button>
    <button class="tab-btn" data-type="one-way">One-way</button>
    <button class="tab-btn" data-type="multi-city">Multi-city</button>
  `;
  block.append(tabContainer);

  // Create Form Wrapper
  const formWrapper = document.createElement('form');
  formWrapper.className = 'flight-search-form';
  formWrapper.innerHTML = `
    <div class="form-group route-group">
      <div class="input-wrapper">
        <label for="flight-origin">From</label>
        <input type="text" id="flight-origin" placeholder="Origin" value="BKK" autocomplete="off" required>
        <div class="autocomplete-list" id="origin-list"></div>
      </div>
      <button type="button" class="swap-btn" aria-label="Swap Route">⇄</button>
      <div class="input-wrapper">
        <label for="flight-destination">To</label>
        <input type="text" id="flight-destination" placeholder="Destination" autocomplete="off" required>
        <div class="autocomplete-list" id="dest-list"></div>
      </div>
    </div>
    
    <div class="form-group date-group">
      <div class="input-wrapper">
        <label for="flight-depart">Depart</label>
        <input type="date" id="flight-depart" required>
      </div>
      <div class="input-wrapper" id="return-wrapper">
        <label for="flight-return">Return</label>
        <input type="date" id="flight-return">
      </div>
    </div>
    
    <div class="form-group passenger-group">
      <div class="input-wrapper">
        <label for="flight-passengers">Passengers & Class</label>
        <select id="flight-passengers">
          <option value="1">1 Adult, Economy</option>
          <option value="2">2 Adults, Economy</option>
          <option value="business">1 Adult, Business</option>
        </select>
      </div>
    </div>
    
    <div class="form-action">
      <button type="submit" class="button primary cta-search">Search Flights</button>
    </div>
  `;
  block.append(formWrapper);

  // Tab Interaction Logic
  const returnWrapper = formWrapper.querySelector('#return-wrapper');
  tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const type = e.target.dataset.type;
      
      // Toggle return date visibility
      if (type === 'one-way') {
        returnWrapper.style.display = 'none';
        returnWrapper.querySelector('input').removeAttribute('required');
      } else {
        returnWrapper.style.display = 'block';
        returnWrapper.querySelector('input').setAttribute('required', 'true');
      }
    });
  });

  // Autocomplete API Fetch Logic
  const apiEndpoint = 'https://6a30ec2ea7f8866418d6aec8.mockapi.io/airports';
  let airports = [];

  const fetchAirports = async () => {
    if (airports.length > 0) return airports;
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('API Response Error');
      airports = await response.json();
    } catch (error) {
      console.error('Failed to fetch airports:', error);
      airports = []; // Fallback
    }
    return airports;
  };

  const setupAutocomplete = (inputId, listId) => {
    const input = formWrapper.querySelector(`#${inputId}`);
    const list = formWrapper.querySelector(`#${listId}`);

    input.addEventListener('focus', async () => {
      const data = await fetchAirports();
      renderList(data, list, input);
    });

    input.addEventListener('input', async (e) => {
      const data = await fetchAirports();
      const val = e.target.value.toLowerCase();
      const filtered = data.filter(a => 
        a.city.toLowerCase().includes(val) || 
        a.code.toLowerCase().includes(val) || 
        a.airportName.toLowerCase().includes(val)
      );
      renderList(filtered, list, input);
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.innerHTML = '';
      }
    });
  };

  const renderList = (data, container, inputElement) => {
    container.innerHTML = '';
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.innerHTML = `<strong>${item.city} (${item.code})</strong> - <small>${item.airportName}, ${item.country}</small>`;
      div.addEventListener('click', () => {
        inputElement.value = item.code;
        container.innerHTML = '';
      });
      container.append(div);
    });
  };

  setupAutocomplete('flight-origin', 'origin-list');
  setupAutocomplete('flight-destination', 'dest-list');

  // Form Submit Handler
  formWrapper.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Search Triggered');
    // Implement redirect to booking flow
  });
}
