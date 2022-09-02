### Arc GIS Online Tutorial

- [ArcGIS Online](https://www.arcgis.com/index.html)
- Sign In
- Sing in with "Your ArcGIS organization's URL"
  - uri.maps.arcgis.com
  - Use your SSO credentials


### Make a Layer for Content

We would like to store your collected data so we can show it on a map. The data you collected is either 
- Point Data 
  - Measurement like Strike and Dip
- Line Data
  - Faults, Fractures, Joints
- Polygon Data (Area)
  - Unit Boundaries

To create a Layer for Point Data, go to **Content** on the Top Navigation bar.  If it is not there, click on **Home** and then it should be visible.
- Click Content
- Click New Item
- Select Feature Layer
- Define your own Layer
- Using the "Create a feature layer"
  - Change the Layer Name, "Layer_1" to a recognizable name: "Points"
  - Make it a **Point layer**
- Click the Add Button below to add layers for a "Line Layer" and a "Polygon Layer"
- Click Next
- Provide a Title
- Click Save

You should now be at a Page describing your new Layer.
- To add fields like name, unit, strike, and dip we need to modify the fields
- Click **Data** in the blue bar (next to Overview)
- Click on **Fields** (on the far right side below the blue bar next to Table)
- Make sure **Points** is the Selected Layer (on the left side, below the blue bar)
- Click **Add**
- Provide a Name and a Type
  - An Integer Type is a integer, like 1, and a Double Type is a real-valued number like 1.2
- Add fields for the values you think your point data has
- Change to the Line and Polygon Layer and add the appropriate fields there as well

These layers have no data, but they will soon. You can now add these layers to a Map.


### Make a Map
Click on Map (Top white Navigation bar)
- Click **Add**
- Search for Layers
  - Your layers that you created should show up
- Click either the plus sign in the circle **OR** Click the Layer then Add to Map
- Click on Details and you should see all of your layers

#### Add data to Layer on Map
- Once the Layers are added to the Map you can Click on **Edit**
- Click **New Feature** for the type of thing you would like to add
- Click where you would like to place the point
  - You will get a dialog for the fields that you defined when creating the layer
  - **Warning**: Edits to the Layer definition after adding data points may not preserve the field data
- Fill in the fields, click close

#### Strike and Dip symbol
For strike and dip measurements, a [symbol](https://savage13.github.io/s0d0_00.png) is available.

You can rotate the symbol using the a value for *Strike* and show the Dip as a *Label*

![Strike Dip Symbol](s0d0_00.png)


