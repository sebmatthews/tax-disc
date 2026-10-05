# Tax Disc: The Rules

Version 0.2, draft, 5 October 2026. Proposed by Claude from a shape Seb agreed on 5 October 2026. Version 0.2 records Seb's agreement to the licence start date as an eighth input, the screen's behaviour, and that trailing spaces are not written in batch output. The rates, bands and messages are Claude's proposal and have not been individually reviewed by Seb. When agreed, this document is the specification both versions of the service are built to, and the test cases and checks depend on the exact field names, codes and messages in it.

Everything here is fictional. The structure is modelled loosely on how UK vehicle tax has worked; every rate, threshold and message is invented. Nothing here is the real scheme and nothing should be read as such.

## What The Service Does

Given the details of one vehicle and the date a licence would start, it works out the annual vehicle tax rate in whole pounds, and a code saying which rule produced it.

## Inputs

| Field | Format | Notes |
| --- | --- | --- |
| Registration mark | Up to 8 characters | Shown back, not checked. |
| Date of first registration | DDMMYY | Two-digit year, windowed (see Dates). |
| Fuel type | P, D or E | Petrol, diesel, electric. |
| CO2 emissions | 0 to 999 g/km | Carbon dioxide (CO2). Needed for vehicles registered from 1 March 2001, except electric. |
| Engine size | 0 to 9999 cc | Cubic centimetres (cc). Needed for vehicles registered before 1 March 2001, except electric. |
| List price | 0 to 999999, whole pounds | Needed for vehicles registered from 1 April 2017. |
| First licence | Y or N | Whether this is the vehicle's first licence. Only matters from 1 April 2017. |
| Licence start date | DDMMYY | The date the licence would start. Two-digit year, windowed. |

The licence start date was added to the seven inputs first agreed, and Seb agreed it on 5 October 2026. The rules for historic vehicles and the five-year supplement need a date to measure from, and taking it from the computer's clock would make the answers change from day to day, which would break the matching check. Ruled out: a fixed date hidden inside both programs.

The green screen converts letters typed into the fuel type and first licence fields to capitals before checking, so a presenter typing 'd' gets diesel. The batch records are checked exactly as given: a lower-case letter in a batch record is an error. The modern version must do the same.

## Dates

Dates are held as six digits, DDMMYY, as much real COBOL (Common Business-Oriented Language) code was. Two-digit years are read through a fixed window: 50 to 99 mean 1950 to 1999, and 00 to 49 mean 2000 to 2049.

This is deliberate, and is a talking point. A car first registered in 1949 cannot be entered: 49 is read as 2049, so the system rejects it as registered after the licence starts. The modern version must behave exactly the same way. Modernisation preserves behaviour, quirks included; fixing a quirk is a separate, deliberate change.

A date is valid when the month is 1 to 12 and the day exists in that month, including 29 February in leap years of the windowed year.

## The Order Of The Rules

Checks first, then the first rule that applies, in this order.

1. Validation. Any failure gives rate 0 and an error code (see Errors). No further rules apply.
2. Historic vehicle. If the year of first registration is 40 or more years before the year of the licence start date, the rate is 0. Code `HIST`.
3. Electric vehicle. If the fuel type is E, the rate is 0. Code `ELEC`.
4. Registered before 1 March 2001: by engine size (Era A).
5. Registered from 1 March 2001 to 31 March 2017: by emissions band (Era B).
6. Registered from 1 April 2017: first-year rate or standard rate (Era C).

## Era A: Registered Before 1 March 2001

| Engine size | Rate | Code |
| --- | --- | --- |
| Up to 1549 cc | £210 | `ENG1` |
| Over 1549 cc | £345 | `ENG2` |

## Era B: Registered From 1 March 2001 To 31 March 2017

| Band | CO2 g/km | Rate | Code |
| --- | --- | --- | --- |
| 1 | Up to 100 | £15 | `B1` |
| 2 | 101 to 120 | £35 | `B2` |
| 3 | 121 to 150 | £165 | `B3` |
| 4 | 151 to 170 | £220 | `B4` |
| 5 | 171 to 190 | £270 | `B5` |
| 6 | 191 to 225 | £380 | `B6` |
| 7 | Over 225 | £640 | `B7` |

Diesel moves up one band. A diesel in band 7 stays in band 7.

## Era C: Registered From 1 April 2017

First licence: the first-year rate by emissions.

| Band | CO2 g/km | Rate | Code |
| --- | --- | --- | --- |
| 1 | Up to 50 | £10 | `F1` |
| 2 | 51 to 100 | £160 | `F2` |
| 3 | 101 to 130 | £210 | `F3` |
| 4 | 131 to 150 | £260 | `F4` |
| 5 | 151 to 190 | £700 | `F5` |
| 6 | 191 to 255 | £1600 | `F6` |
| 7 | Over 255 | £2700 | `F7` |

Diesel moves up one band. A diesel in band 7 stays in band 7.

Not a first licence: the standard rate of £195, code `STD`. If the list price is over £40,000 and the licence starts before the fifth anniversary of first registration, a supplement of £425 is added, for £620, code `STDS`. The fifth anniversary of a 29 February registration is 28 February.

## Errors

Rate 0 and the first error found, checked in this order.

| Code | Message on screen | When |
| --- | --- | --- |
| `E01` | INVALID DATE OF FIRST REGISTRATION | Not a valid date. |
| `E02` | INVALID LICENCE START DATE | Not a valid date. |
| `E03` | FIRST REGISTRATION AFTER LICENCE START | Windowed first registration date is after the licence start date. |
| `E04` | FUEL TYPE MUST BE P, D OR E | Anything else. |
| `E05` | FIRST LICENCE MUST BE Y OR N | Anything else. |

Missing numbers are read as zero, as the legacy screen does: a vehicle with no CO2 entered is treated as band 1. This is a quirk the modern version keeps.

## Batch Records

For the matching check, both versions read and write the same fixed-width records, one vehicle per line.

Input, 35 characters:

| Columns | Field |
| --- | --- |
| 1 to 8 | Registration mark, left aligned, space filled |
| 9 to 14 | Date of first registration, DDMMYY |
| 15 | Fuel type |
| 16 to 18 | CO2, zero filled |
| 19 to 22 | Engine size, zero filled |
| 23 to 28 | List price, zero filled |
| 29 | First licence |
| 30 to 35 | Licence start date, DDMMYY |

Output, up to 17 characters. Trailing spaces are not written, as GnuCOBOL's line sequential files drop them, so a two-letter code such as `B3` gives a 15-character line. The modern version must write the same:

| Columns | Field |
| --- | --- |
| 1 to 8 | Registration mark |
| 9 to 13 | Rate in whole pounds, zero filled |
| 14 to 17 | Code, left aligned, space filled |

## The Screen

The screen's behaviour is not part of the matching check, but the modern version should match it.

Numbers are typed as text and converted, so 95 typed into the three-digit CO2 field means 95, and a date typed as 10612 means 010612. Blank, or anything that is not a whole number, is read as zero. After Enter, the screen shows each number back in full, with leading zeros.

Letters typed into the fuel type and first licence fields are converted to capitals before checking.

After Enter the screen shows the annual rate, the rule code and a short description of the rule, and a message line: the error message for an error, otherwise 'RATE CALCULATED FOR' and the registration mark.

| Code | Description on screen |
| --- | --- |
| `HIST` | HISTORIC VEHICLE, EXEMPT |
| `ELEC` | ELECTRIC, ZERO RATE |
| `ENG1` | PRE 2001, UP TO 1549 CC |
| `ENG2` | PRE 2001, OVER 1549 CC |
| `B1` to `B7` | 2001 TO 2017, BAND n |
| `F1` to `F7` | FIRST LICENCE, BAND n |
| `STD` | STANDARD RATE |
| `STDS` | STANDARD PLUS SUPPLEMENT |

## Worked Examples

All with a licence start date of 1 October 2026 (011026) unless stated.

| Vehicle | Rate | Code |
| --- | --- | --- |
| Petrol, first registered 1 June 2012, 145 g/km | £165 | `B3` |
| The same, diesel | £220 | `B4` |
| Petrol, first registered 15 March 1998, 1400 cc | £210 | `ENG1` |
| Petrol, first registered 1 July 1984 | £0 | `HIST` |
| Petrol, first registered 1 June 1949, entered as 010649 | £0 | `E03` |
| Electric, first registered 1 May 2022 | £0 | `ELEC` |
| Petrol, first registered 1 March 2023, not first licence, list price £45,000 | £620 | `STDS` |
| Petrol, first registered 1 June 2020, not first licence, list price £45,000 | £195 | `STD` |
| Petrol, first registered 1 September 2026, first licence, 120 g/km | £210 | `F3` |
| The same, diesel | £260 | `F4` |
